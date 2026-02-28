import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg
            width="14"
            height="14"
            viewBox="0 0 76 65"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          <span>
            {"\u00A9"} 2026 Vercel Swag Store. All rights reserved.
          </span>
        </div>
        <nav className="flex items-center gap-4" aria-label="Footer navigation">
          <Link
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/search"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>
        </nav>
      </div>
    </footer>
  );
}
