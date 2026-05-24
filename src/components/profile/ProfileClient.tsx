"use client";

import Link from "next/link";
import Image from "next/image";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { LEARNING_PATHS, COURSES } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";
import { getLevelTitle } from "@/lib/progression";
import { useUserStore } from "@/lib/store";

export function ProfileClient({
  name,
  email,
  imageUrl,
  joinedAt,
}: {
  name: string;
  email: string;
  imageUrl?: string | null;
  joinedAt: string;
}) {
  const { xp, level, streak, lessonsCompleted, achievements, lessonHistory } = useUserStore();

  const lessonsDone = lessonsCompleted.length;
  const coursesFinished = COURSES.filter((course) => course.lessonSlugs.every((slug) => lessonsCompleted.includes(slug))).length;

  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Card className="flex flex-col items-start justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <Image src={imageUrl} alt={name} width={64} height={64} className="h-16 w-16 rounded-full border border-border object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full border border-border bg-surface2" />
            )}
            <div>
              <p className="text-2xl font-bold">{name}</p>
              <p className="text-sm text-text-muted">{email}</p>
              <p className="mt-1 text-sm text-text-muted">Joined {new Date(joinedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent">
              Level {level} · {getLevelTitle(level)}
            </p>
            <Link href="/user-profile" className="mt-3 inline-block rounded-2xl border border-border px-4 py-2 text-sm">
              Edit Profile
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-text-muted">Total XP</p>
            <p className="mt-2 text-2xl font-bold">{xp}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">Current Streak</p>
            <p className="mt-2 text-2xl font-bold">{streak}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">Lessons Completed</p>
            <p className="mt-2 text-2xl font-bold">
              {lessonsDone} / {LESSONS.length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">Courses Finished</p>
            <p className="mt-2 text-2xl font-bold">{coursesFinished}</p>
          </Card>
        </div>

        <section>
          <h2 className="mb-3 text-xl font-bold">Achievements</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.earned ? "border-accent/50 bg-accent/10" : "opacity-70 grayscale"}>
                <p className="text-2xl">{achievement.icon}</p>
                <p className="mt-2 font-semibold">
                  {achievement.title} {!achievement.earned ? "🔒" : ""}
                </p>
                <p className="mt-1 text-sm text-text-muted">{achievement.description}</p>
                <p className="mt-2 text-xs text-text-muted">{achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : "Locked"}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Learning Path Progress</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {LEARNING_PATHS.map((path) => {
              const pathCourses = COURSES.filter((course) => course.pathSlug === path.slug);
              const pathLessons = pathCourses.flatMap((course) => course.lessonSlugs);
              const done = pathLessons.filter((slug) => lessonsCompleted.includes(slug)).length;
              const pct = pathLessons.length ? Math.round((done / pathLessons.length) * 100) : 0;
              return (
                <Card key={path.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">{path.title}</p>
                    <Link href={`/courses#${path.slug}`} className="text-sm text-accent">
                      View
                    </Link>
                  </div>
                  <div className="h-2 rounded-full bg-surface2">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-text-muted">{pct}% complete</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Lesson History</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface2 text-text-muted">
                <tr>
                  <th className="px-4 py-3">Lesson</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">XP</th>
                </tr>
              </thead>
              <tbody>
                {[...lessonHistory]
                  .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
                  .map((entry) => {
                    const lesson = LESSONS.find((item) => item.slug === entry.lessonSlug);
                    const course = COURSES.find((item) => item.id === lesson?.courseId);
                    return (
                      <tr key={`${entry.lessonSlug}-${entry.completedAt}`} className="border-t border-border">
                        <td className="px-4 py-3">{lesson?.title ?? entry.lessonSlug}</td>
                        <td className="px-4 py-3">{course?.title ?? "Core"}</td>
                        <td className="px-4 py-3">{entry.score}%</td>
                        <td className="px-4 py-3">{new Date(entry.completedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{entry.xpEarned}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
