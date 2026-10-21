import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, MousePointer2 } from "lucide-react";
import { blinkLesson } from "../content/lessons/blink-led";
import { lessons } from "../content/lessons";
import { CircuitCanvas } from "../components/circuit/CircuitCanvas";
import { LessonCard } from "../components/lesson/LessonCard";
export default function Home() {
  return (
    <>
      <header className="home-header">
        <Link href="/" className="brand">
          esp32<span>lab</span>
          <i />
        </Link>
        <a href="#aulas" className="header-link">
          Sua próxima descoberta <ArrowRight size={16} />
        </a>
      </header>
      <main className="home-main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" /> IDEIAS QUE ACENDEM
            </p>
            <h1>
              Aprenda eletrônica.
              <br />
              <span>Uma conexão</span>
              <br />
              de cada vez.
            </h1>
            <p>
              Transforme curiosidade em circuitos. Descubra o ESP32 com projetos
              visuais, etapas curtas e aquele momento de “agora entendi”.
            </p>
            <a href="#aulas" className="primary">
              Monte seu primeiro circuito <ArrowRight size={18} />
            </a>
            <div className="hero-proof">
              <CheckCircle2 size={16} /> Do zero, no seu ritmo. Sem complicação.
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-label">
              <Zap size={16} /> DA IDEIA À PRIMEIRA LUZ <span>01 / 01</span>
            </div>
            <CircuitCanvas
              parts={blinkLesson.components}
              connections={blinkLesson.connections}
              highlight={[]}
              pins={[]}
              blink
            />
            <div className="floating-note">
              <MousePointer2 size={18} />
              <span>
                Conexões que fazem sentido.
                <br />
                <strong>Aprendizado que fica.</strong>
              </span>
            </div>
          </div>
        </section>
        <section className="catalog" id="aulas">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">SUA JORNADA COMEÇA AQUI</p>
              <h2>Pequenos passos. Descobertas reais.</h2>
            </div>
            <span>
              {String(lessons.length).padStart(2, "0")} projetos disponíveis
            </span>
          </div>
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </section>
        <footer>
          esp32 lab{" "}
          <span>Feito para quem aprende colocando a mão na massa.</span>
        </footer>
      </main>
    </>
  );
}
