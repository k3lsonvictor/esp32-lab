import Link from "next/link";
export default function NotFound() {
  return (
    <main className="completion">
      <p className="eyebrow">404 · CAMINHO NÃO ENCONTRADO</p>
      <h1>Essa aula ainda não está na bancada.</h1>
      <Link className="primary" href="/">
        Conhecer os projetos
      </Link>
    </main>
  );
}
