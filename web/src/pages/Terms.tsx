import SiteLayout, { Section, Bullets } from "@/components/SiteLayout";

export default function Terms() {
  return (
    <SiteLayout
      title="Terms of Use"
      subtitle="Effective date: 19 August 2026. These terms govern your use of the CyrusGuard AI app."
    >
      <Section heading="Acceptance">
        <p>
          By downloading or using CyrusGuard AI, you agree to these terms. If you do not agree, do
          not use the app. Purchases made through the App Store are also governed by Apple&apos;s{" "}
          <a
            href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
            className="text-[#2FF07A] hover:underline"
          >
            Standard End User License Agreement
          </a>
          .
        </p>
      </Section>

      <Section heading="Licence">
        <p>
          We grant you a personal, non-exclusive, non-transferable, revocable licence to use
          CyrusGuard AI on Apple devices you own or control, for your own non-commercial use. You may
          not copy, resell, reverse engineer, or redistribute the app.
        </p>
      </Section>

      <Section heading="Subscriptions, free trial, and cancellation">
        <Bullets
          items={[
            "CyrusGuard AI requires an active subscription. There is no free tier.",
            "Monthly plan: USD 2.99 per month. Annual plan: USD 29.99 per year. Local prices are set by the App Store for your region.",
            "Eligible new subscribers receive a 7-day free trial. No amount is charged during the trial.",
            "Unless you cancel, your subscription renews automatically and your Apple Account is charged at the end of the free trial and then at the start of each renewal period.",
            "Cancel at least 24 hours before the current period ends, in Settings > Apple Account > Subscriptions, or through Profile > Manage subscription in the app.",
            "Cancelling stops future renewals; you keep access until the end of the period you already paid for.",
            "Any unused part of a free trial is forfeited when you purchase a subscription.",
            "Refunds are handled by Apple at reportaproblem.apple.com — we cannot issue them directly.",
          ]}
        />
      </Section>

      <Section heading="No account required">
        <p>
          You are not required to register an account. Signing in with Apple is optional and only
          links your subscription across devices. If you do sign in, you are responsible for keeping
          access to your Apple Account secure, and you can delete the identity at any time from
          Profile &gt; Delete Account.
        </p>
      </Section>

      <Section heading="Automated analysis — important disclaimer">
        <p>
          CyrusGuard AI uses automated artificial intelligence to estimate how risky a message,
          image, or website appears. Results are probabilistic opinions, not verified facts, and they
          can be wrong in both directions: a dangerous message may be scored as safe, and a
          legitimate one may be flagged as risky.
        </p>
        <p>
          The app does not provide legal, financial, banking, or security advice, and it is not a
          substitute for your own judgement or for professional guidance. Never make a payment,
          transfer, or disclosure decision on the basis of a CyrusGuard AI score alone. If you
          believe you are the victim of fraud, contact your bank and your local authorities.
        </p>
      </Section>

      <Section heading="Acceptable use">
        <p>You agree not to:</p>
        <Bullets
          items={[
            "Submit content you have no right to share, or that contains another person's sensitive data without their consent",
            "Use the app to develop, test, or refine fraudulent or malicious content",
            "Attempt to disrupt, overload, or gain unauthorised access to the service",
            "Use automated means to scrape or bulk-query the analysis service",
            "Use the app in any way that breaks applicable law",
          ]}
        />
      </Section>

      <Section heading="Content you submit">
        <p>
          You keep ownership of the messages, images, and addresses you submit. You grant us only the
          limited permission needed to transmit and process that content to return your analysis, as
          described in the{" "}
          <a href="/privacy" className="text-[#2FF07A] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </Section>

      <Section heading="Availability and changes">
        <p>
          Analyses require an internet connection and depend on third-party services, so the app may
          be temporarily unavailable. We may modify, suspend, or discontinue features. If we make a
          material change to a paid feature, you may cancel your subscription as described above.
        </p>
      </Section>

      <Section heading="Termination">
        <p>
          You may stop using the app at any time by cancelling your subscription and deleting the
          app. We may suspend or terminate access if you breach these terms.
        </p>
      </Section>

      <Section heading="Disclaimer and limitation of liability">
        <p>
          To the fullest extent permitted by law, the app is provided &quot;as is&quot; and &quot;as
          available&quot;, without warranties of any kind, including accuracy, fitness for a
          particular purpose, or uninterrupted operation.
        </p>
        <p>
          To the fullest extent permitted by law, our total liability arising out of or relating to
          the app is limited to the amount you paid for your subscription in the 12 months before the
          event giving rise to the claim. Nothing in these terms excludes liability that cannot be
          excluded by law, including your statutory consumer rights.
        </p>
      </Section>

      <Section heading="Changes to these terms">
        <p>
          We may update these terms. The effective date above will change, and continued use after an
          update means you accept the revised terms.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these terms:{" "}
          <a href="mailto:support@cyrusguard.ai" className="text-[#2FF07A] hover:underline">
            support@cyrusguard.ai
          </a>
          .
        </p>
      </Section>
    </SiteLayout>
  );
}
