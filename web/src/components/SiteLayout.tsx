import { memo, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Home" },
  { to: "/support", label: "Support" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/privacy-choices", label: "Privacy Choices" },
];

interface SiteLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Shared shell for every public legal and support page. */
const SiteLayout = memo(function SiteLayout({ title, subtitle, children }: SiteLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#010906] text-[#F2FBF5]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(60rem 40rem at 50% -10%, rgba(47,240,122,0.16), transparent 65%), linear-gradient(#0a1f14 1px, transparent 1px), linear-gradient(90deg, #0a1f14 1px, transparent 1px)",
          backgroundSize: "100% 100%, 46px 46px, 46px 46px",
        }}
      />

      <div className="relative">
        <header className="border-b border-[#2FF07A]/15 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2FF07A]/35 bg-[#2FF07A]/10">
                <ShieldCheck className="h-5 w-5 text-[#2FF07A]" />
              </span>
              <span className="text-base font-bold tracking-tight">CyrusGuard AI</span>
            </Link>

            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    pathname === item.to
                      ? "font-semibold text-[#2FF07A]"
                      : "text-[#A1AEA8] transition-colors hover:text-[#F2FBF5]"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-5 py-12">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-2xl text-[#A1AEA8]">{subtitle}</p> : null}
          <div className="mt-10 space-y-8">{children}</div>
        </main>

        <footer className="border-t border-[#2FF07A]/15">
          <div className="mx-auto max-w-4xl space-y-3 px-5 py-10 text-sm text-[#61736B]">
            <p className="flex flex-wrap gap-x-4 gap-y-2">
              {NAV.slice(1).map((item) => (
                <Link key={item.to} to={item.to} className="transition-colors hover:text-[#2FF07A]">
                  {item.label}
                </Link>
              ))}
              <a
                href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                className="transition-colors hover:text-[#2FF07A]"
              >
                Apple Standard EULA
              </a>
            </p>
            <p>CyrusGuard AI · 1055 Rue Lucien-L&apos;Allier, Unit #1036, Montreal, QC H3G 3C4, Canada</p>
            <p>
              Contact:{" "}
              <a href="mailto:support@cyrusguard.ai" className="text-[#2FF07A] hover:underline">
                support@cyrusguard.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
});

export default SiteLayout;

/** Titled content block used across the legal pages. */
export const Section = memo(function Section({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#2FF07A]/20 bg-[#04180F]/80 p-6 sm:p-7">
      <h2 className="text-lg font-bold tracking-tight text-[#F2FBF5]">{heading}</h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#A1AEA8]">{children}</div>
    </section>
  );
});

/** Bulleted list with the CyrusGuard accent marker. */
export const Bullets = memo(function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2FF07A]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
});
