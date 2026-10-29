import { BrandLogo } from "@/components/brand/brandLogo";
import { Button } from "@/components/ui/button";

const links = [
    { href: "#ranking", label: "Ranking" },
    { href: "#findings", label: "Findings" }
];

const SiteHeader = () => (
    <header className="flex items-center justify-between gap-4 py-6">
        <a href="#top" aria-label="Blood Work Audit home" className="rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            <BrandLogo />
        </a>

        <nav
            aria-label="Sections"
            className="flex items-center gap-1 rounded-2xl bg-card/80 p-1.5 shadow-[0_1px_2px_rgb(42_36_33/0.04)] ring-1 ring-border/60 backdrop-blur">
            {links.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    className="hidden rounded-xl px-4 py-2 text-[0.95rem] text-foreground transition-colors hover:bg-muted sm:inline-block">
                    {link.label}
                </a>
            ))}
            <Button asChild size="lg" className="rounded-xl px-4">
                <a href="#panels">Browse panels</a>
            </Button>
        </nav>
    </header>
);

export { SiteHeader };
