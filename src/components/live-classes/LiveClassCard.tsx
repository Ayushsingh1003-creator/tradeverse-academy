import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Users } from "lucide-react";
import type { LiveClassCourse } from "@/lib/data/liveClasses";

export function LiveClassCard({ course }: { course: LiveClassCourse }) {
  return (
    <div className="tvd-ccard">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={course.heroImageUrl}
        alt=""
        loading="lazy"
        style={{
          height: 160,
          width: "100%",
          borderRadius: 14,
          objectFit: "cover",
          border: "1px solid var(--tv-line)",
        }}
      />

      <div className="tvd-eyebrow">{course.level}</div>
      <h3 style={{ marginTop: 0 }}>{course.title}</h3>
      <p className="tvd-cdesc">{course.subtitle}</p>

      <div className="tvd-cmeta" style={{ gap: 10, flexDirection: "column" }}>
        <span>
          <CalendarDays size={12} aria-hidden style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
          Starts {course.startDate} · {course.durationWeeks} weeks
        </span>
        <span>
          <Clock size={12} aria-hidden style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
          {course.schedule}
        </span>
        <span>
          <Users size={12} aria-hidden style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
          {course.seatsLeft} of {course.seats} seats left
        </span>
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <b style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.02em" }}>{course.priceLabel}</b>
        <Link href={`/live-classes/${course.slug}`} className="tvd-ccta">
          View details
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
