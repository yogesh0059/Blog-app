import { useSyncExternalStore } from "react";

export type Category = { id: string; name: string; color: string };
export type Comment = { id: string; postId: string; author: string; body: string; createdAt: number };
export type Post = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  categoryId: string;
  author: string;
  status: "draft" | "published";
  createdAt: number;
};

type State = { posts: Post[]; categories: Category[]; comments: Comment[] };

const KEY = "blog-store-v1";

const seed: State = {
  categories: [
    { id: "c1", name: "Engineering", color: "#38bdf8" },
    { id: "c2", name: "Design", color: "#a78bfa" },
    { id: "c3", name: "Product", color: "#f472b6" },
  ],
  posts: [
    {
      id: "p1",
      title: "Building a Blog Management REST API",
      excerpt: "A walkthrough of designing clean CRUD endpoints for posts, categories and comments.",
      body: "In this post we cover REST conventions, validation, error handling and Postman testing.\n\nWe'll structure endpoints as /posts, /categories, /comments — each supporting standard verbs.",
      categoryId: "c1",
      author: "Aarav",
      status: "published",
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: "p2",
      title: "Designing dark, focused dashboards",
      excerpt: "Contrast, hierarchy and restraint — three rules for interfaces that don't fight you.",
      body: "Great dashboards feel calm. Use one accent, keep type tight, and let data breathe.",
      categoryId: "c2",
      author: "Meera",
      status: "published",
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: "p3",
      title: "Roadmap: what's shipping this quarter",
      excerpt: "A preview of the features moving from draft to production.",
      body: "Three themes: reliability, speed, and delight. Details below.",
      categoryId: "c3",
      author: "Kabir",
      status: "draft",
      createdAt: Date.now() - 86400000,
    },
  ],
  comments: [
    { id: "cm1", postId: "p1", author: "Riya", body: "Loved the endpoint layout!", createdAt: Date.now() - 3600_000 },
    { id: "cm2", postId: "p2", author: "Dev", body: "The restraint tip hit hard.", createdAt: Date.now() - 7200_000 },
  ],
};

function load(): State {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as State;
  } catch {
    return seed;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function save() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  save();
}

const id = () => Math.random().toString(36).slice(2, 10);

export const blogStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    return state;
  },
  addPost(p: Omit<Post, "id" | "createdAt">) {
    set({ posts: [{ ...p, id: id(), createdAt: Date.now() }, ...state.posts] });
  },
  updatePost(id: string, p: Partial<Post>) {
    set({ posts: state.posts.map((x) => (x.id === id ? { ...x, ...p } : x)) });
  },
  deletePost(id: string) {
    set({
      posts: state.posts.filter((x) => x.id !== id),
      comments: state.comments.filter((c) => c.postId !== id),
    });
  },
  addCategory(c: Omit<Category, "id">) {
    set({ categories: [...state.categories, { ...c, id: id() }] });
  },
  deleteCategory(cid: string) {
    if (state.posts.some((p) => p.categoryId === cid)) return false;
    set({ categories: state.categories.filter((c) => c.id !== cid) });
    return true;
  },
  addComment(c: Omit<Comment, "id" | "createdAt">) {
    set({ comments: [{ ...c, id: id(), createdAt: Date.now() }, ...state.comments] });
  },
  deleteComment(id: string) {
    set({ comments: state.comments.filter((c) => c.id !== id) });
  },
  reset() {
    state = seed;
    save();
  },
};

export function useBlogStore() {
  return useSyncExternalStore(blogStore.subscribe, blogStore.get, blogStore.get);
}
