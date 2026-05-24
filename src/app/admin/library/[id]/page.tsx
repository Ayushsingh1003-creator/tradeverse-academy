import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { LibraryCourseForm } from "../LibraryCourseForm";

export default async function EditLibraryCoursePage({ params }: { params: { id: string } }) {
  const course = await db.libraryCourse.findUnique({ where: { id: params.id } });
  if (!course) notFound();
  return <LibraryCourseForm course={course} />;
}
