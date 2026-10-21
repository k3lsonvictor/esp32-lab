import { notFound } from "next/navigation";
import { lessons } from "../../../content/lessons/blink-led";
import { LessonPlayer } from "../../../components/lesson/LessonPlayer";
export function generateStaticParams() {
  return lessons.map((l) => ({ lessonId: l.id }));
}
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
