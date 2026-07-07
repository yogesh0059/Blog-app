import { Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { blogStore } from "@/lib/blog-store";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/docs", label: "API Docs", icon: BookOpen },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
            <Sparkles className="h-4 w-4 text-brand-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Inkwell</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Blog Studio
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm text-foreground bg-accent" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              blogStore.reset();
              toast.success("Demo data restored");
            }}
          >
            Reset demo
          </Button>
          <Button asChild size="sm" className="bg-gradient-brand text-brand-foreground shadow-glow hover:opacity-90">
            <Link to="/analytics">
              <BarChart3 className="mr-1.5 h-4 w-4" /> Insights
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
