import { BookOpen, Download, ExternalLink } from "lucide-react";
import type { Lesson } from "../../features/lessons/schema";

export function SupplementaryMaterials({
  materials,
}: {
  materials: Lesson["materials"];
}) {
  if (!materials?.length) return null;
  return (
    <section
      className="supplementary-materials"
      aria-labelledby="materials-heading"
    >
      <div className="materials-heading">
        <BookOpen size={21} aria-hidden="true" />
        <div>
          <p className="eyebrow">PARA CONTINUAR EXPLORANDO</p>
          <h2 id="materials-heading">Material complementar</h2>
        </div>
      </div>
      {materials.map((material) => (
        <article className="material-card" key={material.href}>
          <div className="material-copy">
            <span className="badge">{material.details}</span>
            <h3>{material.title}</h3>
            <p>{material.description}</p>
            {material.note && (
              <p className="material-note">
                <strong>Nesta aula e no PDF</strong>
                <br />
                {material.note}
              </p>
            )}
          </div>
          <div className="material-actions">
            <a
              className="primary"
              href={material.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir PDF <ExternalLink size={16} aria-hidden="true" />
              <span className="sr-only"> (nova aba)</span>
            </a>
            <a
              className="secondary"
              href={material.href}
              download={material.filename}
            >
              Baixar material <Download size={16} aria-hidden="true" />
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}
