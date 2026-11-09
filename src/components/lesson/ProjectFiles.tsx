import { Download, FileCode2 } from "lucide-react";
import type { Lesson } from "../../features/lessons/schema";
export function ProjectFiles({
  downloads,
}: {
  downloads: Lesson["downloads"];
}) {
  if (!downloads?.length) return null;
  return (
    <section className="project-files" aria-labelledby="project-files-title">
      <p className="eyebrow">LEVE O PROJETO PARA A BANCADA</p>
      <h2 id="project-files-title">Arquivos do projeto</h2>
      <p>
        Baixe o pacote, extraia e abra <code>carinha_esp32.ino</code> na IDE
        Arduino. Os três headers devem ficar na mesma pasta. O ZIP inclui
        instruções e o código adaptado usado nesta aula.
      </p>
      <div className="project-file-list">
        {downloads.map((file, i) => (
          <a
            key={file.href}
            className={i === 0 ? "project-file featured" : "project-file"}
            href={file.href}
            download={file.filename}
          >
            <FileCode2 size={21} aria-hidden="true" />
            <span>
              <strong>{file.title}</strong>
              <small>{file.description}</small>
            </span>
            <Download size={18} aria-hidden="true" />
          </a>
        ))}
      </div>
      <p className="file-note">
        As bibliotecas e a plataforma ESP32 são instaladas separadamente pela
        IDE. Confira o modelo do display antes de alimentar o circuito.
      </p>
    </section>
  );
}
