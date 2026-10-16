"use client";

import Link from "next/link";
import Image from "next/image";
import { Award, BookOpen, Flame, GraduationCap, Lock, Zap } from "lucide-react";
import { AchievementIcon } from "@/components/icons/AchievementIcon";
import { AppShell, ThemeScope } from "@/components/layout/AppShell";
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
  const coursesFinished = COURSES.filter((course) =>
    course.lessonSlugs.every((slug) => lessonsCompleted.includes(slug)),
  ).length;
  const history = [...lessonHistory].sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  // Earned first, in the order they were unlocked — earliest at the top — then
  // the ones still locked.
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    if (a.earned && b.earned) return (a.earnedAt ?? "").localeCompare(b.earnedAt ?? "");
    return 0;
  });

  return (
    <ThemeScope>
      <AppShell>
        <div className="tvd-pagehead">
          <h1>Profile</h1>
          <p>Your account, progress, and achievements.</p>
        </div>

        <section className="tvd-hero" style={{ marginTop: 18 }}>
          <span className="tvd-avatar" aria-hidden>
            {imageUrl ? (
              <Image src={imageUrl} alt="" width={64} height={64} />
            ) : (
              (name.trim().charAt(0).toUpperCase() || "?")
            )}
          </span>
          <div className="tvd-herobody">
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>
              {name}
            </h2>
            <p style={{ marginBottom: 10 }}>
              {email} · Joined {new Date(joinedAt).toLocaleDateString()}
            </p>
            <div className="tvd-chips">
              <span className="tvd-tag" data-tone="acc">
                <Award size={14} aria-hidden />
                Level {level} · {getLevelTitle(level)}
              </span>
            </div>
          </div>
        </section>

        <div className="tvd-srule">
          <h2>Overview</h2>
          <i />
        </div>

        <div className="tvd-stats">
          <div className="tvd-stat">
            <small>
              <Zap size={13} aria-hidden />
              Total XP
            </small>
            <b>{xp}</b>
          </div>
          <div className="tvd-stat">
            <small>
              <Flame size={13} aria-hidden />
              Current streak
            </small>
            <b>{streak}</b>
            <span className="tvd-statsub">{streak === 1 ? "day" : "days"}</span>
          </div>
          <div className="tvd-stat">
            <small>
              <BookOpen size={13} aria-hidden />
              Lessons done
            </small>
            <b>{lessonsDone}</b>
            <span className="tvd-statsub">of {LESSONS.length}</span>
          </div>
          <div className="tvd-stat">
            <small>
              <GraduationCap size={13} aria-hidden />
              Courses finished
            </small>
            <b>{coursesFinished}</b>
            <span className="tvd-statsub">of {COURSES.length}</span>
          </div>
        </div>

        <div className="tvd-srule">
          <h2>Achievements</h2>
          <i />
        </div>
        {achievements.length === 0 ? (
          <div className="tvd-card">
            <p className="tvd-empty">No achievements yet — finish a lesson to earn your first.</p>
          </div>
        ) : (
          <div className="tvd-grid">
            {sortedAchievements.map((achievement) => (
              <div key={achievement.id} className="tvd-ccard" data-done={achievement.earned ? "" : undefined}>
                <div className="tvd-ccard-top">
                  <span className="tvd-ctile" aria-hidden>
                    {achievement.earned ? <AchievementIcon icon={achievement.icon} size={20} /> : <Lock size={18} />}
                  </span>
                </div>
                <h3>{achievement.title}</h3>
                <p className="tvd-cdesc">{achievement.description}</p>
                <div className="tvd-cmeta">
                  <span>
                    {achievement.earnedAt
                      ? new Date(achievement.earnedAt).toLocaleDateString()
                      : "Locked"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="tvd-srule">
          <h2>Learning path progress</h2>
          <i />
        </div>
        <div className="tvd-grid">
          {LEARNING_PATHS.map((path) => {
            const pathCourses = COURSES.filter((course) => course.pathSlug === path.slug);
            const pathLessons = pathCourses.flatMap((course) => course.lessonSlugs);
            const done = pathLessons.filter((slug) => lessonsCompleted.includes(slug)).length;
            const pct = pathLessons.length ? Math.round((done / pathLessons.length) * 100) : 0;
            return (
              <div key={path.id} className="tvd-card">
                <h5 className="tvd-cardh">
                  {path.title}
                  <Link href={`/courses#${path.slug}`} className="tvd-lk">
                    View
                  </Link>
                </h5>
                <div className="tvd-prog">
                  <div className="tvd-track">
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tvd-progval">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="tvd-srule">
          <h2>Lesson history</h2>
          <i />
        </div>
        <div className="tvd-tablewrap">
          {history.length === 0 ? (
            <p className="tvd-empty">Nothing here yet — your finished lessons will be listed here.</p>
          ) : (
            <table className="tvd-table">
              <thead>
                <tr>
                  <th>Lesson</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  const lesson = LESSONS.find((item) => item.slug === entry.lessonSlug);
                  const course = COURSES.find((item) => item.id === lesson?.courseId);
                  return (
                    <tr key={`${entry.lessonSlug}-${entry.completedAt}`}>
                      <td>{lesson?.title ?? entry.lessonSlug}</td>
                      <td className="tvd-num">{course?.title ?? "Core"}</td>
                      <td className="tvd-num">{entry.score}%</td>
                      <td className="tvd-num">{new Date(entry.completedAt).toLocaleDateString()}</td>
                      <td className="tvd-num">{entry.xpEarned}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </AppShell>
    </ThemeScope>
  );
}
