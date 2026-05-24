import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { LiveCohortForm } from "../LiveCohortForm";

export default async function EditLiveCohortPage({ params }: { params: { id: string } }) {
  const cohort = await db.liveCohort.findUnique({ where: { id: params.id } });
  if (!cohort) notFound();
  return <LiveCohortForm cohort={cohort} />;
}
