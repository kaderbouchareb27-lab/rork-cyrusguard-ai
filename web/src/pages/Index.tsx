import { Link } from "react-router-dom";
import { LifeBuoy, Lock, ScrollText, SlidersHorizontal, ScanSearch, Link2, ImageDown } from "lucide-react";
import SiteLayout, { Section, Bullets } from "@/components/SiteLayout";

const LINKS: { to: string; label: string; description: string; Icon: typeof LifeBuoy }[] = [
  { to: "/support", label: "Support", description: "Get help, report a problem, or ask a billing question.", Icon: LifeBuoy },
  { to: "/privacy", label: "Privacy Policy", description: "What we collect, why, and how to have it deleted.", Icon: Lock },
  { to: "/terms", label: "Terms of Use", description: "Subscription, trial, renewal, and cancellation terms.", Icon: ScrollText },
  { to: "/privacy-choices", label: "Privacy Choices", description: "Request access, export, or deletion of your data.", Icon: SlidersHorizontal },
];

const FEATURES: { title: string; body: string; Icon: typeof ScanSearch }[] = [
  { title: "Message analysis", body: "Paste a suspicious SMS, email, or chat message and get a risk score with a plain-language explanation.", Icon: ScanSearch },
  { title: "Screenshot analysis", body: "Import a screenshot or photo of a suspicious message and have its content read and assessed.", Icon: ImageDown },
  { title: "Website analysis", body: "Enter a web address before you click it and get a trust score for the destination.", Icon: Link2 },
];

export default function Index() {
  return (
    <SiteLayout
      title="CyrusGuard AI"
      subtitle="An iPhone app that helps you spot scams, phishing, and fraudulent websites before they cost you anything. These pages provide the public support, privacy, and legal information for the app."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ title, body, Icon }) => (
          <div key={title} className="rounded-2xl border border-[#2FF07A]/20 bg-[#04180F]/80 p-5">
            <Icon className="h-6 w-6 text-[#2FF07A]" />
            <h2 className="mt-4 text-base font-bold text-[#F2FBF5]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#A1AEA8]">{body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map(({ to, label, description, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-[#2FF07A]/20 bg-[#04180F]/80 p-5 transition-colors hover:border-[#2FF07A]/50"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-[#2FF07A]" />
              <span className="font-bold text-[#F2FBF5] group-hover:text-[#2FF07A]">{label}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#A1AEA8]">{description}</p>
          </Link>
        ))}
      </div>

      <Section heading="Subscription at a glance">
        <p>
          CyrusGuard AI is a subscription app. Eligible new subscribers get a 7-day free trial with no
          charge during the trial period.
        </p>
        <Bullets
          items={[
            "Monthly plan: USD 2.99 per month, renews automatically.",
            "Annual plan: USD 29.99 per year, renews automatically.",
            "Payment is charged to your Apple Account at the end of the free trial, and at the start of each renewal period after that.",
            "Cancel at least 24 hours before the current period ends to avoid renewal, in Settings > Apple Account > Subscriptions.",
            "Prices shown are in US dollars; your local price is set by the App Store for your region.",
          ]}
        />
      </Section>

      <Section heading="No account required">
        <p>
          You do not have to create an account or give us an email address to use CyrusGuard AI.
          Signing in with Apple is optional and only used to carry your subscription across your
          devices. If you do sign in, you can delete that identity at any time from Profile &gt;
          Delete Account inside the app.
        </p>
      </Section>
    </SiteLayout>
  );
}
