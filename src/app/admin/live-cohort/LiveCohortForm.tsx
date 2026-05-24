"use client";

import type { LiveCohort } from "@prisma/client";
import Link from "next/link";
import {
  AdminFormLayout,
  FormField,
  FormSection,
  FormSelect,
  SaveBar,
} from "@/components/admin/AdminFormLayout";
import { CurriculumBuilder } from "@/components/admin/CurriculumBuilder";
import { deleteLiveCohort, saveLiveCohort } from "./actions";

function tagsDisplay(tagsJson: string) {
  try {
    return (JSON.parse(tagsJson) as string[]).join(", ");
  } catch {
    return "";
  }
}

export function LiveCohortForm({ cohort }: { cohort?: LiveCohort }) {
  const isEdit = Boolean(cohort);

  return (
    <>
    <form action={saveLiveCohort}>
      <input type="hidden" name="id" value={cohort?.id ?? ""} />
      <AdminFormLayout title={isEdit ? "Edit Live Cohort" : "New Live Cohort"} backHref="/admin/live-cohort">
        <FormSection title="Basics">
          <FormField label="Title" name="title" defaultValue={cohort?.title} required />
          <FormField label="Subtitle" name="subtitle" defaultValue={cohort?.subtitle} />
          <FormField label="Slug" name="slug" defaultValue={cohort?.slug} required />
          <FormField label="Description" name="description" type="textarea" defaultValue={cohort?.description} />
          <FormSelect
            label="Status"
            name="status"
            defaultValue={cohort?.status ?? "draft"}
            options={["draft", "published", "completed"]}
          />
        </FormSection>

        <FormSection title="Instructor">
          <FormField label="Name" name="instructorName" defaultValue={cohort?.instructorName} required />
          <FormField label="Bio" name="instructorBio" type="textarea" defaultValue={cohort?.instructorBio} />
          <FormField label="Avatar URL" name="instructorAvatarUrl" defaultValue={cohort?.instructorAvatarUrl ?? ""} />
        </FormSection>

        <FormSection title="Schedule">
          <FormField label="Start date" name="startDate" defaultValue={cohort?.startDate} hint="YYYY-MM-DD" required />
          <FormField label="Duration (weeks)" name="durationWeeks" type="number" defaultValue={cohort?.durationWeeks ?? 6} />
          <FormField label="Schedule text" name="schedule" defaultValue={cohort?.schedule} />
        </FormSection>

        <FormSection title="Pricing">
          <FormField label="Price label" name="priceLabel" defaultValue={cohort?.priceLabel} />
          <FormField label="Price amount (minor units)" name="priceAmount" type="number" defaultValue={cohort?.priceAmount ?? 0} />
          <FormSelect label="Currency" name="currency" defaultValue={cohort?.currency ?? "INR"} options={["INR", "USD"]} />
          <FormField label="Stripe price ID" name="stripePriceId" defaultValue={cohort?.stripePriceId ?? ""} />
        </FormSection>

        <FormSection title="Media">
          <FormField label="Sample YouTube video ID" name="sampleYoutubeVideoId" defaultValue={cohort?.sampleYoutubeVideoId} />
          <FormField label="Hero image URL" name="heroImageUrl" defaultValue={cohort?.heroImageUrl} />
          <FormField label="Recording URL" name="recordingUrl" defaultValue={cohort?.recordingUrl ?? ""} />
        </FormSection>

        <FormSection title="Capacity & tags">
          <FormField label="Seats" name="seats" type="number" defaultValue={cohort?.seats ?? 100} />
          <FormField label="Seats left" name="seatsLeft" type="number" defaultValue={cohort?.seatsLeft ?? 100} />
          <FormSelect
            label="Level"
            name="level"
            defaultValue={cohort?.level ?? "Beginner"}
            options={["Beginner", "Intermediate", "Advanced"]}
          />
          <FormField
            label="Tags"
            name="tags"
            defaultValue={cohort ? tagsDisplay(cohort.tags) : ""}
            hint="Comma-separated"
          />
        </FormSection>

        <FormSection title="Curriculum">
          <CurriculumBuilder initialJson={cohort?.curriculumJson ?? "[]"} />
        </FormSection>

        <SaveBar backHref="/admin/live-cohort" />

        {isEdit && cohort ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
            <Link
              href={`/admin/live-cohort/${cohort.id}/enrollments`}
              className="text-sm font-semibold text-[#456DFF] hover:underline"
            >
              View enrollments →
            </Link>
          </div>
        ) : null}
      </AdminFormLayout>
    </form>

    {isEdit && cohort ? (
      <form
        action={deleteLiveCohort.bind(null, cohort.id)}
        className="mt-8 max-w-3xl"
        onSubmit={(e) => {
          if (!confirm("Delete this cohort and all enrollments?")) e.preventDefault();
        }}
      >
        <button
          type="submit"
          className="rounded-xl border border-red-500/40 px-6 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10"
        >
          Delete cohort
        </button>
      </form>
    ) : null}
    </>
  );
}
