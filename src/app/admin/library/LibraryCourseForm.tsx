import type { LibraryCourse as DbCourse } from "@prisma/client";
import Link from "next/link";
import {
  AdminFormLayout,
  FormField,
  FormSection,
  FormSelect,
  FormToggle,
  SaveBar,
} from "@/components/admin/AdminFormLayout";
import { deleteLibraryCourse, saveLibraryCourse } from "./actions";

function tagsDisplay(tagsJson: string) {
  try {
    return (JSON.parse(tagsJson) as string[]).join(", ");
  } catch {
    return "";
  }
}

export function LibraryCourseForm({ course }: { course?: DbCourse }) {
  const isEdit = Boolean(course);

  return (
    <div className="space-y-6">
      <form action={saveLibraryCourse}>
        <input type="hidden" name="id" value={course?.id ?? ""} />
        <AdminFormLayout title={isEdit ? "Edit Library Course" : "New Library Course"} backHref="/admin/library">
          <FormSection title="Basics">
            <FormField label="Title" name="title" defaultValue={course?.title} required />
            <FormField label="Slug" name="slug" defaultValue={course?.slug} hint="URL-safe identifier" required />
            <FormField label="Description" name="description" type="textarea" defaultValue={course?.description} />
            <FormField label="Thumbnail URL" name="thumbnailUrl" defaultValue={course?.thumbnailUrl} />
            <FormSelect
              label="Level"
              name="level"
              defaultValue={course?.level ?? "Beginner"}
              options={["Beginner", "Intermediate", "Advanced"]}
            />
            <FormField
              label="Tags"
              name="tags"
              defaultValue={course ? tagsDisplay(course.tags) : ""}
              hint="Comma-separated"
            />
            <FormField
              label="Duration (minutes)"
              name="estimatedDurationMin"
              type="number"
              defaultValue={course?.estimatedDurationMin ?? 0}
            />
            <FormField label="Order" name="order" type="number" defaultValue={course?.order ?? 0} />
            <FormToggle label="Published" name="published" defaultChecked={course?.published ?? true} />
          </FormSection>
          <SaveBar backHref="/admin/library" />

          {isEdit && course ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
              <Link
                href={`/admin/library/${course.id}/videos`}
                className="text-sm font-semibold text-[#456DFF] hover:underline"
              >
                Manage videos →
              </Link>
            </div>
          ) : null}
        </AdminFormLayout>
      </form>

      {isEdit && course ? (
        <form action={deleteLibraryCourse.bind(null, course.id)} className="pt-2">
          <button
            type="submit"
            className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
          >
            Delete course
          </button>
        </form>
      ) : null}
    </div>
  );
}
