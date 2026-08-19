import SiteLayout, { Section, Bullets } from "@/components/SiteLayout";

export default function PrivacyChoices() {
  return (
    <SiteLayout
      title="Privacy Choices"
      subtitle="How to access, export, or delete your CyrusGuard AI data, and how to withdraw the permissions you granted."
    >
      <Section heading="Delete everything from inside the app">
        <p>
          The fastest route is built into CyrusGuard AI and takes effect immediately, with no email
          required.
        </p>
        <Bullets
          items={[
            "Open the app and go to Profile > Delete Account.",
            "Type the confirmation word shown on screen.",
            "Confirm. Your scan history, analyzed messages, settings, profile, and the optional Apple sign-in identity created by the app are all erased.",
          ]}
        />
        <p>
          Deleting your data does not cancel your paid subscription, because Apple manages billing.
          Cancel separately in Settings &gt; Apple Account &gt; Subscriptions.
        </p>
      </Section>

      <Section heading="Request access or a copy of your data">
        <p>
          Almost everything CyrusGuard AI holds about you already lives on your device and is visible
          in your scan history. If you would like written confirmation of what our providers hold,
          email{" "}
          <a href="mailto:support@cyrusguard.ai" className="text-[#2FF07A] hover:underline">
            support@cyrusguard.ai
          </a>{" "}
          with the subject &quot;Data access request&quot;.
        </p>
      </Section>

      <Section heading="Request deletion by email">
        <p>
          If you have already removed the app and cannot use the in-app flow, email us with the
          subject &quot;Deletion request&quot;. To locate your records, include the approximate date
          you subscribed and, if you used Sign in with Apple, the email address Apple shared with the
          app (it may be a private relay address). We do not ask for any additional identity
          documents.
        </p>
      </Section>

      <Section heading="Opt out">
        <Bullets
          items={[
            "We do not sell or share your personal data, so there is nothing to opt out of.",
            "We do not run advertising or cross-app tracking in CyrusGuard AI.",
            "We do not send marketing emails; we only reply to messages you send us.",
          ]}
        />
      </Section>

      <Section heading="Withdraw app permissions">
        <p>
          Camera and photo access are optional and can be revoked at any time in Settings &gt;
          CyrusGuard AI. The app keeps working — you can still paste text to analyze.
        </p>
      </Section>

      <Section heading="Response times">
        <p>
          We acknowledge requests within 2 business days and complete them within 30 days. If we
          cannot fulfil a request, we will explain why.
        </p>
      </Section>
    </SiteLayout>
  );
}
