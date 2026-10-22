"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
export function CodeViewer({ code }: { code: string }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copiado");
    } catch {
      setStatus("Não foi possível copiar. Selecione o código abaixo.");
    }
  }
  return (
    <div className="code-viewer">
      <div>
        <span>
          programa.ino <small>Arduino</small>
        </span>
        <button onClick={copy}>
          {status === "Copiado" ? <Check size={14} /> : <Copy size={14} />}{" "}
          Copiar
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
      <span role="status">{status}</span>
    </div>
  );
}
