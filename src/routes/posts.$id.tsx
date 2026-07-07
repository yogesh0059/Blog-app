import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calendar, MessageSquare, Send, Trash2, User } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { blogStore, useBlogStore } from "@/lib/blog-store";

export const Route = createFileRoute("/posts/$id")({
  head: () => ({
    meta: [
      { title: "Post — Inkwell" },
      { name: "description", content: "Read a post and its comments in Inkwell." },
    ],
  }),
  component: PostDetail,
  notFoundComponent: PostNotFound,
});

function PostDetail() {
  const { id } = Route.useParams();
  const { posts, categories, comments } = useBlogStore();
  const post = posts.find((p) => p.id === id);
  if (!post) throw notFound();

  const cat = categories.find((c) => c.id === post.categoryId);
  const list = comments.filter((c) => c.postId === post.id);

  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!author.trim() || !body.trim()) return toast.error("Name and comment are required");
    blogStore.addComment({ postId: post.id, author: author.trim(), body: body.trim() });
    setAuthor("");
    setBody("");
    toast.success("Comment posted");
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" richColors position="top-right" />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        <article className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {cat && (
              <Badge
                variant="outline"
                className="border-border/60 text-[10px] uppercase tracking-widest"
                style={{ color: cat.color }}
              >
                {cat.name}
              </Badge>
            )}
            <Badge
              className={
                post.status === "published"
                  ? "border-transparent bg-emerald-500/15 text-emerald-400"
                  : "border-transparent bg-amber-500/15 text-amber-400"
              }
            >
              {post.status}
            </Badge>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> {list.length} comment{list.length === 1 ? "" : "s"}
            </span>
          </div>

          <p className="text-lg text-muted-foreground">{post.excerpt}</p>

          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
            {post.body}
          </div>
        </article>

        <section className="mt-16 border-t border-border/60 pt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            Comments <span className="text-muted-foreground">({list.length})</span>
          </h2>

          <div className="mt-6 space-y-3">
            {list.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
                No comments yet. Start the conversation below.
              </div>
            ) : (
              list.map((c) => (
                <Card key={c.id} className="border-border/60 bg-card/70">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{c.author}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          blogStore.deleteComment(c.id);
                          toast.success("Comment removed");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-foreground/90">{c.body}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card className="mt-6 border-border/60 bg-card/70">
            <CardContent className="space-y-3 p-5">
              <div className="grid gap-2">
                <Label>Your name</Label>
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Alex" />
              </div>
              <div className="grid gap-2">
                <Label>Comment</Label>
                <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your thoughts..." />
              </div>
              <Button onClick={submit} className="w-full bg-gradient-brand text-brand-foreground hover:opacity-90">
                <Send className="mr-1.5 h-4 w-4" /> Post comment
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function PostNotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This post may have been deleted or never existed.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => router.invalidate()} variant="secondary">Try again</Button>
          <Button asChild className="bg-gradient-brand text-brand-foreground">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
