// Servidor local do ESP32 Spotify Player.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(directory, "config.json");
if (!fs.existsSync(configPath)) {
  console.error(
    "Copie config.example.json para config.json e preencha os dados.",
  );
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const PORT = 3001;
const REDIRECT = "http://127.0.0.1:3001/callback";
const TOKEN_FILE = path.join(directory, "tokens.json");
const SCOPES =
  "user-read-currently-playing user-read-playback-state user-modify-playback-state";
const clientId = config.clientId;
const clientSecret = config.clientSecret;
let token = fs.existsSync(TOKEN_FILE)
  ? JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"))
  : null;
let pendingState = null;
let cache = { at: 0, value: null };
const albumImages = new Map(); // capa em RGB565, cache limitada
const COVER_SIZE = 52;

if (
  ![clientId, clientSecret, config.deviceKey].every(
    (value) =>
      typeof value === "string" &&
      value.trim() &&
      !value.startsWith("PREENCHA_"),
  )
) {
  console.error("Preencha clientId, clientSecret e deviceKey no config.json");
  process.exit(1);
}
function basicAuth() {
  return (
    "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
  );
}
function saveToken(data) {
  token = {
    ...token,
    ...data,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
  };
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2), { mode: 0o600 });
}
async function exchange(params) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  if (!response.ok) throw new Error("Token Spotify: " + JSON.stringify(data));
  saveToken(data);
}
async function accessToken() {
  if (!token) throw new Error("Abra http://127.0.0.1:3001/login no computador");
  if (Date.now() > token.expires_at - 60000) {
    if (!token.refresh_token)
      throw new Error("Sem refresh_token: autorize novamente");
    await exchange({
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
    });
  }
  return token.access_token;
}
async function spotifyAPI(endpoint, method = "GET", retry = true) {
  const access = await accessToken();
  const response = await fetch("https://api.spotify.com/v1" + endpoint, {
    method,
    headers: { Authorization: "Bearer " + access },
  });
  if (response.status === 401 && retry && token?.refresh_token) {
    await exchange({
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
    });
    return spotifyAPI(endpoint, method, false);
  }
  if (!response.ok && response.status !== 204) {
    const body = await response.text();
    throw new Error(
      "Spotify HTTP " + response.status + ": " + body.slice(0, 240),
    );
  }
  return response.status === 204 ? null : response.json();
}
function asciiText(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?");
}
async function capaRGB565(imageURL) {
  const cached = albumImages.get(imageURL);
  if (cached) return cached;
  const parsed = new URL(imageURL);
  // Aceita apenas os enderecos oficiais de capas do Spotify.
  if (
    parsed.protocol !== "https:" ||
    !["i.scdn.co", "mosaic.scdn.co"].includes(parsed.hostname)
  ) {
    throw new Error("URL de capa nao autorizada");
  }
  const response = await fetch(imageURL, {
    redirect: "error",
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok)
    throw new Error("Falha ao baixar capa: HTTP " + response.status);
  const source = Buffer.from(await response.arrayBuffer());
  if (source.length > 4_000_000)
    throw new Error("Capa excede o tamanho maximo");
  // Ajusta sem cortar a imagem original (fit: contain).
  const { data, info } = await sharp(source)
    .resize(COVER_SIZE, COVER_SIZE, { fit: "contain", background: "#000000" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (
    info.channels !== 3 ||
    info.width !== COVER_SIZE ||
    info.height !== COVER_SIZE
  ) {
    throw new Error("Conversao de capa invalida");
  }
  const buffer = Buffer.alloc(COVER_SIZE * COVER_SIZE * 2);
  for (let i = 0; i < COVER_SIZE * COVER_SIZE; i++) {
    const r = data[i * 3],
      g = data[i * 3 + 1],
      b = data[i * 3 + 2];
    const rgb565 = ((r & 0xf8) << 8) | ((g & 0xfc) << 3) | (b >> 3);
    buffer.writeUInt16LE(rgb565, i * 2); // Little endian do ESP32
  }
  if (albumImages.size >= 12)
    albumImages.delete(albumImages.keys().next().value);
  albumImages.set(imageURL, buffer);
  return buffer;
}
function json(res, status, obj) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(obj));
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1:" + PORT);
    if (req.method === "GET" && url.pathname === "/login") {
      // Autenticacao so pelo navegador do proprio computador.
      if (
        !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
          req.socket.remoteAddress,
        )
      ) {
        return json(res, 403, { error: "Login apenas no computador local" });
      }
      pendingState = crypto.randomBytes(18).toString("hex");
      const authURL = new URL("https://accounts.spotify.com/authorize");
      for (const [k, v] of Object.entries({
        response_type: "code",
        client_id: clientId,
        scope: SCOPES,
        redirect_uri: REDIRECT,
        state: pendingState,
      })) {
        authURL.searchParams.set(k, v);
      }
      res.writeHead(302, { Location: authURL.toString() });
      return res.end();
    }
    if (req.method === "GET" && url.pathname === "/callback") {
      if (
        !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
          req.socket.remoteAddress,
        )
      ) {
        return json(res, 403, { error: "Callback apenas no computador local" });
      }
      if (!pendingState || url.searchParams.get("state") !== pendingState) {
        return json(res, 400, { error: "State invalido" });
      }
      pendingState = null;
      if (!url.searchParams.get("code"))
        return json(res, 400, {
          error: url.searchParams.get("error") || "Sem code",
        });
      await exchange({
        grant_type: "authorization_code",
        code: url.searchParams.get("code"),
        redirect_uri: REDIRECT,
      });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(
        "<h2>Spotify conectado!</h2><p>Agora abra uma musica no Spotify e ligue o ESP32.</p>",
      );
    }
    // Todas as rotas do ESP32 exigem a chave privada do dispositivo.
    if (req.headers["x-device-key"] !== config.deviceKey)
      return json(res, 401, { error: "deviceKey incorreta" });
    if (url.pathname === "/api/current" && req.method === "GET") {
      if (Date.now() - cache.at < 4000 && cache.value)
        return json(res, 200, cache.value);
      const data = await spotifyAPI("/me/player/currently-playing");
      const track = data?.item;
      const value =
        track && track.type === "track"
          ? {
              active: true,
              playing: Boolean(data.is_playing),
              title: asciiText(track.name),
              artist: asciiText(
                (track.artists || []).map((a) => a.name).join(", "),
              ),
              duration: track.duration_ms || 0,
              progress: data.progress_ms || 0,
              coverId: track.album?.id || "",
              coverUrl: track.album?.images?.[0]?.url || "",
            }
          : {
              active: false,
              playing: false,
              title: "Sem musica",
              artist: "Abra o Spotify",
              duration: 0,
              progress: 0,
              coverId: "",
              coverUrl: "",
            };
      cache = { at: Date.now(), value };
      return json(res, 200, value);
    }
    if (url.pathname === "/api/cover" && req.method === "GET") {
      const albumId = url.searchParams.get("id") || "";
      const current = cache.value;
      if (
        !current?.active ||
        !current.coverUrl ||
        current.coverId !== albumId
      ) {
        return json(res, 409, {
          error: "Capa nao corresponde a musica atual. Aguarde nova consulta.",
        });
      }
      const data = await capaRGB565(current.coverUrl);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Length": data.length,
        "Cache-Control": "no-store",
      });
      return res.end(data);
    }
    if (req.method === "POST" && url.pathname === "/api/toggle") {
      // Consulta o estado diretamente para evitar decidir com base em cache antigo.
      const player = await spotifyAPI("/me/player");
      if (!player?.device)
        return json(res, 409, { error: "Nenhum dispositivo Spotify ativo" });
      const deveTocar = !Boolean(player.is_playing);
      await spotifyAPI("/me/player/" + (deveTocar ? "play" : "pause"), "PUT");
      cache = { at: 0, value: null };
      return json(res, 200, { ok: true, playing: deveTocar });
    }
    if (
      req.method === "POST" &&
      (url.pathname === "/api/next" || url.pathname === "/api/previous")
    ) {
      await spotifyAPI(
        "/me/player/" + (url.pathname.endsWith("next") ? "next" : "previous"),
        "POST",
      );
      cache = { at: 0, value: null };
      return json(res, 200, { ok: true });
    }
    return json(res, 404, { error: "Rota nao encontrada" });
  } catch (e) {
    console.error(e.message);
    return json(res, 502, { error: e.message });
  }
});
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
  console.log(
    "Abra http://127.0.0.1:3001/login no computador e autorize o Spotify.",
  );
});
