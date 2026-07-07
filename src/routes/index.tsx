import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  FileText,
  FolderKanban,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit3,
  Send,
  Layers,
  Rocket,
  ArrowRight,
  BookOpen,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { blogStore, useBlogStore, type Post } from "@/lib/blog-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inkwell — Blog Management Studio" },
      {
        name: "description",
        content:
          "A calm, keyboard-friendly studio for managing blog posts, categories and comments.",
      },
      { property: "og:title", content: "Inkwell — Blog Management Studio" },
      {
        property: "og:description",
        content: "A modern dashboard for managing blog content — posts, categories and comments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const state = useBlogStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("posts");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.posts.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      );
    });
  }, [state.posts, query, filter]);

  const stats = useMemo(
    () => ({
      published: state.posts.filter((p) => p.status === "published").length,
      drafts: state.posts.filter((p) => p.status === "draft").length,
      categories: state.categories.length,
      comments: state.comments.length,
    }),
    [state],
  );

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" richColors position="top-right" />
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <Hero />

        <section className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={<Rocket className="h-4 w-4" />} label="Published" value={stats.published} />
          <StatCard icon={<Edit3 className="h-4 w-4" />} label="Drafts" value={stats.drafts} />
          <StatCard icon={<Layers className="h-4 w-4" />} label="Categories" value={stats.categories} />
          <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Comments" value={stats.comments} />
        </section>

        <section className="mt-10">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList className="bg-card/60 backdrop-blur">
                <TabsTrigger value="posts" className="gap-2">
                  <FileText className="h-4 w-4" /> Posts
                </TabsTrigger>
                <TabsTrigger value="categories" className="gap-2">
                  <FolderKanban className="h-4 w-4" /> Categories
                </TabsTrigger>
                <TabsTrigger value="comments" className="gap-2">
                  <MessageSquare className="h-4 w-4" /> Comments
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap items-center gap-2">
                {tab === "posts" && (
                  <>
                    <div className="inline-flex rounded-md border border-border/60 bg-card/60 p-0.5">
                      {(["all", "published", "draft"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`rounded px-3 py-1 text-xs capitalize transition-colors ${
                            filter === f
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-56 pl-9"
                      />
                    </div>
                    <PostDialog />
                  </>
                )}
                {tab === "categories" && <CategoryDialog />}
              </div>
            </div>

            <TabsContent value="posts" className="mt-6">
              <PostsGrid posts={filteredPosts} />
            </TabsContent>
            <TabsContent value="categories" className="mt-6">
              <CategoriesPanel />
            </TabsContent>
            <TabsContent value="comments" className="mt-6">
              <CommentsPanel />
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-border/60 bg-gradient-surface p-8 shadow-soft sm:p-12">
      <div className="max-w-2xl">
        <Badge variant="secondary" className="mb-4 gap-1.5 rounded-full border-border/60 bg-card/60">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> v1.0 — Now with drafts & comments
        </Badge>
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Manage your blog like a{" "}
          <span className="text-gradient-brand">newsroom</span>, not a spreadsheet.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Inkwell gives you posts, categories and comments in one calm, keyboard-friendly studio.
          Everything is stored locally — ship it anywhere and it just works.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <PostDialog
            trigger={
              <Button className="bg-gradient-brand text-brand-foreground shadow-glow hover:opacity-90">
                <Plus className="mr-1.5 h-4 w-4" /> New post
              </Button>
            }
          />
          <Button asChild variant="secondary">
            <Link to="/docs">
              <BookOpen className="mr-1.5 h-4 w-4" /> Read the API docs
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/analytics">
              <BarChart3 className="mr-1.5 h-4 w-4" /> View analytics
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">{label}</span>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-foreground">
            {icon}
          </span>
        </div>
        <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function PostsGrid({ posts }: { posts: Post[] }) {
  const { categories, comments } = useBlogStore();
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" />}
        title="No posts match"
        hint="Try clearing the search or creating a new post."
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((p) => {
        const cat = categories.find((c) => c.id === p.categoryId);
        const commentCount = comments.filter((c) => c.postId === p.id).length;
        return (
          <Card
            key={p.id}
            className="group relative flex flex-col overflow-hidden border-border/60 bg-card/70 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-glow"
          >
            <div
              className="absolute inset-x-0 top-0 h-0.5 opacity-70"
              style={{ background: cat?.color ?? "var(--brand)" }}
            />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className="border-border/60 text-[10px] uppercase tracking-widest"
                  style={{ color: cat?.color }}
                >
                  {cat?.name ?? "Uncategorized"}
                </Badge>
                <StatusBadge status={p.status} />
              </div>
              <CardTitle className="mt-2 text-lg leading-snug">
                <Link
                  to="/posts/$id"
                  params={{ id: p.id }}
                  className="transition-colors hover:text-brand"
                >
                  {p.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4">
              <p className="line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>By {p.author}</span>
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {commentCount}
                  </span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <Button asChild size="sm" variant="ghost" className="gap-1.5 -ml-2 text-brand hover:bg-brand/10 hover:text-brand">
                  <Link to="/posts/$id" params={{ id: p.id }}>
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <div className="flex items-center gap-1">
                  <PostDialog
                    post={p}
                    trigger={
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      blogStore.deletePost(p.id);
                      toast.success("Post deleted");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: Post["status"] }) {
  if (status === "published") {
    return (
      <Badge className="border-transparent bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20">
        Published
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-amber-500/15 text-amber-400 hover:bg-amber-500/20">
      Draft
    </Badge>
  );
}

export function PostDialog({ post, trigger }: { post?: Post; trigger?: React.ReactNode }) {
  const { categories } = useBlogStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Post, "id" | "createdAt">>(
    post
      ? {
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          categoryId: post.categoryId,
          author: post.author,
          status: post.status,
        }
      : {
          title: "",
          excerpt: "",
          body: "",
          categoryId: categories[0]?.id ?? "",
          author: "",
          status: "draft",
        },
  );

  const submit = () => {
    if (!form.title.trim() || !form.author.trim() || !form.categoryId) {
      toast.error("Title, author and category are required");
      return;
    }
    if (post) {
      blogStore.updatePost(post.id, form);
      toast.success("Post updated");
    } else {
      blogStore.addPost(form);
      toast.success("Post created");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-gradient-brand text-brand-foreground shadow-glow hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" /> New post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit post" : "New post"}</DialogTitle>
          <DialogDescription>
            {post ? "Update the details for this article." : "Draft an article for your blog."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="A crisp headline" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Author</Label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Excerpt</Label>
            <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="One-line summary" />
          </div>
          <div className="grid gap-2">
            <Label>Body</Label>
            <Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your post..." />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: Post["status"]) => setForm({ ...form, status: v })}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-brand text-brand-foreground hover:opacity-90">
            {post ? "Save changes" : "Create post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CategoryDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#38bdf8");

  const submit = () => {
    if (!name.trim()) return toast.error("Category name is required");
    blogStore.addCategory({ name: name.trim(), color });
    toast.success("Category added");
    setName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-brand text-brand-foreground shadow-glow hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" /> New category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>Group your posts by topic.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div className="grid gap-2">
            <Label>Accent color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-brand text-brand-foreground hover:opacity-90">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CategoriesPanel() {
  const { categories, posts } = useBlogStore();
  if (categories.length === 0) {
    return <EmptyState icon={<FolderKanban className="h-5 w-5" />} title="No categories" hint="Add one to organize posts." />;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const count = posts.filter((p) => p.categoryId === c.id).length;
        return (
          <Card key={c.id} className="border-border/60 bg-card/70 backdrop-blur transition-colors hover:border-brand/40">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl" style={{ background: c.color }} />
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{count} post{count === 1 ? "" : "s"}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  const ok = blogStore.deleteCategory(c.id);
                  if (!ok) toast.error("Category has posts — reassign first");
                  else toast.success("Category removed");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CommentsPanel() {
  const { posts, comments } = useBlogStore();
  const [postId, setPostId] = useState(posts[0]?.id ?? "");
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");

  const list = comments.filter((c) => c.postId === postId);
  const activePost = posts.find((p) => p.id === postId);

  const submit = () => {
    if (!postId) return toast.error("Pick a post first");
    if (!author.trim() || !body.trim()) return toast.error("Author and comment are required");
    blogStore.addComment({ postId, author: author.trim(), body: body.trim() });
    setAuthor("");
    setBody("");
    toast.success("Comment posted");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base">Add comment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label>Post</Label>
            <Select value={postId} onValueChange={setPostId}>
              <SelectTrigger><SelectValue placeholder="Choose a post" /></SelectTrigger>
              <SelectContent>
                {posts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

      <div className="space-y-3">
        {activePost && (
          <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Thread on</div>
            <Link
              to="/posts/$id"
              params={{ id: activePost.id }}
              className="mt-1 inline-flex items-center gap-1 font-medium hover:text-brand"
            >
              {activePost.title} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
        {list.length === 0 ? (
          <EmptyState icon={<MessageSquare className="h-5 w-5" />} title="No comments" hint="Be the first to reply." />
        ) : (
          list.map((c) => (
            <Card key={c.id} className="border-border/60 bg-card/70 backdrop-blur">
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
                    onClick={() => { blogStore.deleteComment(c.id); toast.success("Comment removed"); }}
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
    </div>
  );
}

function EmptyState({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-card/40 p-16 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-foreground">{icon}</div>
      <div className="mt-4 text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <div>© {new Date().getFullYear()} Inkwell Studio</div>
        <div>Crafted with restraint · Dark theme by default</div>
      </div>
    </footer>
  );
}
