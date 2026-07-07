import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Docs — Inkwell" },
      { name: "description", content: "REST reference for Inkwell — posts, categories and comments." },
      { property: "og:title", content: "API Docs — Inkwell" },
      { property: "og:description", content: "REST reference for Inkwell — posts, categories and comments." },
    ],
  }),
  component: Docs,
});

type Ep = { method: "GET" | "POST" | "PUT" | "DELETE"; path: string; desc: string };

const endpoints: { group: string; items: Ep[] }[] = [
  {
    group: "Posts",
    items: [
      { method: "GET", path: "/api/posts", desc: "List all posts. Supports ?status=published|draft and ?category=<id>." },
      { method: "GET", path: "/api/posts/:id", desc: "Fetch a single post by id." },
      { method: "POST", path: "/api/posts", desc: "Create a post. Body: { title, excerpt, body, categoryId, author, status }." },
      { method: "PUT", path: "/api/posts/:id", desc: "Update fields on an existing post." },
      { method: "DELETE", path: "/api/posts/:id", desc: "Delete a post and its comments." },
    ],
  },
  {
    group: "Categories",
    items: [
      { method: "GET", path: "/api/categories", desc: "List all categories." },
      { method: "POST", path: "/api/categories", desc: "Create a category. Body: { name, color }." },
      { method: "DELETE", path: "/api/categories/:id", desc: "Delete a category (rejected if in use)." },
    ],
  },
  {
    group: "Comments",
    items: [
      { method: "GET", path: "/api/posts/:id/comments", desc: "List comments for a post." },
      { method: "POST", path: "/api/posts/:id/comments", desc: "Add a comment. Body: { author, body }." },
      { method: "DELETE", path: "/api/comments/:id", desc: "Remove a comment." },
    ],
  },
];

const methodColor: Record<Ep["method"], string> = {
  GET: "bg-emerald-500/15 text-emerald-400",
  POST: "bg-sky-500/15 text-sky-400",
  PUT: "bg-amber-500/15 text-amber-400",
  DELETE: "bg-rose-500/15 text-rose-400",
};

export default function Docs() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
            <BookOpen className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">API reference</h1>
            <p className="text-sm text-muted-foreground">A clean REST surface for the Inkwell studio.</p>
          </div>
        </div>

        <Card className="mt-6 border-border/60 bg-card/70">
          <CardContent className="p-5 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-border/60">Base URL</Badge>
              <code className="rounded bg-accent px-2 py-1 font-mono text-xs text-foreground">
                https://your-app.example.com
              </code>
              <Badge variant="outline" className="border-border/60">JSON</Badge>
              <Badge variant="outline" className="border-border/60">Standard status codes</Badge>
            </div>
            <p className="mt-3">
              All responses are JSON. Validation errors return <code className="font-mono">400</code>,
              missing resources return <code className="font-mono">404</code>, and unexpected failures
              return <code className="font-mono">500</code> with an <code className="font-mono">error</code> field.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-8">
          {endpoints.map((g) => (
            <section key={g.group}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {g.group}
              </h2>
              <div className="mt-3 space-y-2">
                {g.items.map((e) => (
                  <Card key={e.method + e.path} className="border-border/60 bg-card/70 transition-colors hover:border-brand/40">
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4">
                      <span className={`inline-flex h-6 w-16 items-center justify-center rounded-md text-[11px] font-semibold ${methodColor[e.method]}`}>
                        {e.method}
                      </span>
                      <code className="font-mono text-sm text-foreground">{e.path}</code>
                      <span className="text-xs text-muted-foreground sm:ml-auto sm:text-right">{e.desc}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Example request
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-border/60 bg-card/70 p-4 text-xs leading-6 text-foreground/90">
{`curl -X POST https://your-app.example.com/api/posts \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Hello, Inkwell",
    "excerpt": "First post from the API",
    "body": "Full body text...",
    "categoryId": "c1",
    "author": "Aarav",
    "status": "published"
  }'`}
          </pre>
        </section>
      </main>
    </div>
  );
}
