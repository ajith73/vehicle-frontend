import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type LinkItem = {
  to: string;
  label: string;
};

export function PublicLinkGrid({ title, description, links }: { title: string; description: string; links: LinkItem[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
      <div className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black text-foreground sm:text-3xl">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background/40 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(var(--primary),0.08)] hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
