import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  UserCircle,
  Compass,
  Activity,
  LineChart,
  MessageSquare,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/", label: "Profile", icon: UserCircle },
  { href: "/careers", label: "Career Paths", icon: Compass },
  { href: "/simulation", label: "Simulations", icon: Activity },
  { href: "/performance", label: "Performance", icon: LineChart },
  { href: "/feedback", label: "AI Feedback", icon: MessageSquare },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const isActive = (href: string) =>
    location === href || (location === "/profile" && href === "/");

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-sidebar-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-sm leading-none text-sidebar-foreground">Career Intel</p>
              <p className="text-[10px] text-sidebar-foreground/40 mt-0.5 tracking-wide uppercase">AI Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Navigation
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-sidebar-primary" />
                )}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/25 leading-relaxed">
            AI Career Intelligence
            <br />
            Powered by skills analysis
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {navItems.find(n => isActive(n.href)) && (
              <>
                <span>Career Intel</span>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {navItems.find(n => isActive(n.href))?.label}
                </span>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
