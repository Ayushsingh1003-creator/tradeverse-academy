"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { PublicNav } from "@/components/layout/PublicNav";
import { COURSES, LEARNING_PATHS } from "@/lib/data/courses";
import { useUserStore } from "@/lib/store";
import "@/styles/course-design-cards.css";

const CourseDesignCard = dynamic(
  () => import("@/components/gamification/CourseDesignCard").then((m) => m.CourseDesignCard),
  { loading: () => <div className="h-[320px] w-[20rem] max-w-full animate-pulse rounded-[2.25rem] bg-white/5" /> },
);

export default function CoursesPage() {
  const hydrate = useUserStore((s) => s.hydrate);
  const hydrated = useUserStore((s) => s.hydrated);
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return (
    <div className="course-design-cards min-h-screen bg-[#232228] text-white">
      <PublicNav />
      <div className="mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <div className="mb-8 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Courses</h1>
          <p className="mt-1 text-sm text-white/45 md:text-base">Pick a course and track your progress</p>
        </div>

        <div className="flex flex-col gap-12">
          {LEARNING_PATHS.map((path) => {
            const pathCourses = COURSES.filter((c) => c.pathSlug === path.slug);
            if (pathCourses.length === 0) return null;

            return (
              <section key={path.id}>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold capitalize text-white">{path.title}</h2>
                  <p className="mt-1 text-sm text-white/45">{path.description}</p>
                </div>

                <div className="course-design-cards__grid">
                  {pathCourses.map((course, index) => {
                    const completedCount = course.lessonSlugs.filter((slug) =>
                      lessonsCompleted.includes(slug),
                    ).length;

                    return (
                      <CourseDesignCard
                        key={course.id}
                        course={course}
                        index={index}
                        completedCount={completedCount}
                        pathTitle={course.levels[0]?.title ?? course.description}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
