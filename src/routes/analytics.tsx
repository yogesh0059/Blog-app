import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlogStore } from "@/lib/blog-store";
import { BarChart3, MessageSquare, FileText, Layers } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Inkwell" },
      { name: "description", content: "Publishing rhythm, category mix and comment activity at a glance." },
      { property: "og:title", content: "Analytics — Inkwell" },
      { property: "og:description", content: "Publishing rhythm, category mix and comment activity at a glance." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { posts, categories, comments } = useBlogStore();

  const byCategory = useMemo(() => {
    const total = posts.length || 1;
    return categories.map((c) => {
      const count = posts.filter((p) => p.categoryId === c.id).length;
      return { ...c, count, pct: Math.round((count / total) * 100) };
    });
  }, [posts, categories]);

  const byDay = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = posts.filter((p) => p.createdAt >= d.getTime() && p.createdAt < next.getTime()).length;
      days.push({ label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count });
    }
    return days;
  }, [posts]);

  const max = Math.max(1, ...byDay.map((d) => d.count));
  const topPosts = useMemo(() => {
    return [...posts]
      .map((p) => ({ ...p, cc: comments.filter((c) => c.postId === p.id).length }))
      .sort((a, b) => b.cc - a.cc)
      .slice(0, 5);
  }, [posts, comments]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
            <BarChart3 className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">A quick pulse on your publication.</p>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Posts" value={posts.length} icon={<FileText className="h-4 w-4" />} />
          <Stat label="Categories" value={categories.length} icon={<Layers className="h-4 w-4" />} />
          <Stat label="Comments" value={comments.length} icon={<MessageSquare className="h-4 w-4" />} />
          <Stat
            label="Engagement"
            value={posts.length ? (comments.length / posts.length).toFixed(1) : "0"}
            hint="comments / post"
            icon={<BarChart3 className="h-4 w-4" />}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Posts in the last 14 days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end gap-1.5">
                {byDay.map((d) => (
                  <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-brand transition-all group-hover:opacity-100 opacity-80"
                        style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 6 : 2 }}
                        title={`${d.count} post${d.count === 1 ? "" : "s"}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.label.split(" ")[1]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Category mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {byCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories yet.</p>
              ) : (
                byCategory.map((c) => (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="text-muted-foreground">{c.count} · {c.pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <Card className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Top posts by comments</CardTitle>
            </CardHeader>
            <CardContent>
              {topPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              ) : (
                <ol className="divide-y divide-border/60">
                  {topPosts.map((p, i) => (
                    <li key={p.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <span className="flex items-center gap-3">
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-xs text-muted-foreground">{i + 1}</span>
                        <span className="line-clamp-1">{p.title}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" /> {p.cc}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">{label}</span>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-foreground">{icon}</span>
        </div>
        <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}
