"use client";

import { useCallback, useEffect, useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isClerkConfigured } from "@/lib/clerkEnabled";

type Reply = {
  id: string;
  userName: string;
  body: string;
  createdAt: string;
};

type Comment = {
  id: string;
  userName: string;
  userAvatar: string | null;
  userLevel: number;
  body: string;
  upvotes: number;
  pinned: boolean;
  createdAt: string;
  replies: Reply[];
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function insightBadge(body: string) {
  const lower = body.toLowerCase();
  const long = body.length > 80;
  const kw = ["rsi", "candle", "support", "breakout", "risk", "macd", "trend"].some((k) => lower.includes(k));
  return long && kw;
}

export function LessonDiscussion({ lessonSlug }: { lessonSlug: string }) {
  const clerkEnabled = isClerkConfigured();
  const [sort, setSort] = useState<"helpful" | "newest" | "mine">("helpful");
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/lessons/${encodeURIComponent(lessonSlug)}/comments?sort=${sort}`);
    const json = (await res.json()) as { comments?: Comment[] };
    setComments(json.comments ?? []);
    setLoading(false);
  }, [lessonSlug, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitComment = async () => {
    if (!body.trim()) return;
    const res = await fetch(`/api/lessons/${encodeURIComponent(lessonSlug)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    if (res.ok) {
      setBody("");
      void load();
    }
  };

  const toggleUpvote = async (id: string) => {
    await fetch(`/api/lesson-comments/${id}/upvote`, { method: "POST" });
    void load();
  };

  const submitReply = async (commentId: string) => {
    if (!replyBody.trim()) return;
    const res = await fetch(`/api/lesson-comments/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyBody.trim() }),
    });
    if (res.ok) {
      setReplyBody("");
      setReplyTo(null);
      void load();
    }
  };

  return (
    <Card className="mt-10">
      <p className="text-lg font-semibold">{comments.length} traders discussed this lesson</p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {(["helpful", "newest", "mine"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            className={`rounded-full px-3 py-1 ${sort === key ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
          >
            {key === "helpful" ? "Most Helpful" : key === "newest" ? "Newest" : "My Comments"}
          </button>
        ))}
      </div>

      {clerkEnabled ? (
        <>
          <SignedIn>
            <div className="mt-4 space-y-2">
              <textarea
                value={body}
                maxLength={500}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share a trading insight (max 500 chars)..."
                className="min-h-[100px] w-full rounded-2xl border border-border bg-surface2 px-3 py-2 text-sm"
              />
              <Button onClick={() => void submitComment()}>Post comment</Button>
            </div>
          </SignedIn>
          <SignedOut>
            <p className="mt-4 text-sm text-text-muted">Sign in to join the discussion.</p>
          </SignedOut>
        </>
      ) : (
        <p className="mt-4 text-sm text-text-muted">Sign in is unavailable in this environment.</p>
      )}

      <div className="mt-6 space-y-4">
        {loading ? <p className="text-sm text-text-muted">Loading…</p> : null}
        {!loading && comments.length === 0 ? <p className="text-sm text-text-muted">Be the first to comment.</p> : null}
        {comments.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-surface2/60 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{c.userName}</span>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">Lv {c.userLevel}</span>
              {c.pinned ? <span className="text-xs text-amber-400">📌 Pinned</span> : null}
              {insightBadge(c.body) ? <span title="Trading insight">💡</span> : null}
              <span className="text-xs text-text-muted">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="text-xs text-accent" onClick={() => void toggleUpvote(c.id)}>
                ▲ {c.upvotes}
              </button>
              {clerkEnabled ? (
                <SignedIn>
                  <button type="button" className="text-xs text-text-muted" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>
                    Reply
                  </button>
                </SignedIn>
              ) : null}
            </div>
            {replyTo === c.id ? (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-2 py-2 text-sm"
                  rows={2}
                />
                <Button className="text-xs" onClick={() => void submitReply(c.id)}>
                  Send reply
                </Button>
              </div>
            ) : null}
            {c.replies?.length ? (
              <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
                {c.replies.map((r) => (
                  <div key={r.id}>
                    <p className="text-xs font-medium text-text-muted">
                      {r.userName} · {timeAgo(r.createdAt)}
                    </p>
                    <p className="text-sm">{r.body}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
