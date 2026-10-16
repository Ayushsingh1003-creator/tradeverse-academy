"use client";

import { useEffect } from "react";
import { AppShell, ThemeScope } from "@/components/layout/AppShell";
import { CourseGridCard } from "@/components/courses/CourseGridCard";
import { COURSES, LEARNING_PATHS } from "@/lib/data/courses";
import { useUserStore } from "@/lib/store";

export default function CoursesPage() {
  const hydrate = useUserStore((s) => s.hydrate);
  const hydrated = useUserStore((s) => s.hydrated);
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return (
    <ThemeScope>
      <AppShell>
        <div className="tvd-pagehead">
          <h1>Courses</h1>
          <p>Pick a course and track your progress.</p>
        </div>

        {LEARNING_PATHS.map((path) => {
          const pathCourses = COURSES.filter((c) => c.pathSlug === path.slug);
          if (pathCourses.length === 0) return null;

          return (
            <section key={path.id}>
              <div className="tvd-srule">
                <h2>{path.title}</h2>
                <i />
              </div>
              <p className="tvd-secsub">{path.description}</p>

              <div className="tvd-grid">
                {pathCourses.map((course) => (
                  <CourseGridCard
                    key={course.id}
                    course={course}
                    completedCount={
                      course.lessonSlugs.filter((slug) => lessonsCompleted.includes(slug)).length
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </AppShell>
    </ThemeScope>
  );
}
