import SiteLayout, { Section, Bullets } from "@/components/SiteLayout";

export default function Support() {
  return (
    <SiteLayout
      title="Support"
      subtitle="Help for CyrusGuard AI on iPhone and iPad. Every request is handled by email — no account or login is needed to contact us."
    >
      <Section heading="Contact us">
        <p>
          Email{" "}
          <a href="mailto:support@cyrusguard.ai" className="text-[#2FF07A] hover:underline">
            support@cyrusguard.ai
          </a>
          . We read every message and aim to reply within 2 business days.
        </p>
        <p>You can write to us in English or in French.</p>
      </Section>

      <Section heading="What to include in your message">
        <Bullets
          items={[
            "App version (shown in Profile > About inside the app)",
            "Your device model, for example iPhone 14 Pro",
            "Your iOS version",
            "A description of what you expected and what happened instead",
            "A screenshot or the error message when there is one",
            "For billing questions: the Apple receipt or the date of purchase",
          ]}
        />
        <p>
          Please do not send us passwords, banking details, or full credit card numbers. We never ask
          for them.
        </p>
      </Section>

      <Section heading="Subscription and billing help">
        <p>
          Subscriptions are sold and billed by Apple, so cancellations and refunds are handled
          through your Apple Account.
        </p>
        <Bullets
          items={[
            "Cancel or change plan: open Settings > tap your name > Subscriptions > CyrusGuard AI.",
            "You can also open Profile > Manage subscription in the app, which takes you to the same Apple page.",
            "Cancel at least 24 hours before the trial or current period ends to avoid the next charge.",
            "Refunds are granted by Apple at reportaproblem.apple.com.",
            "Bought on another device or reinstalled the app? Tap Restore purchases on the subscription screen.",
          ]}
        />
      </Section>

      <Section heading="Common questions">
        <p>
          <span className="font-semibold text-[#F2FBF5]">The app asks me to subscribe right away.</span>{" "}
          CyrusGuard AI is a subscription app with no free tier. Eligible new subscribers get a 7-day
          free trial and are not charged during it.
        </p>
        <p>
          <span className="font-semibold text-[#F2FBF5]">My analysis will not start.</span> Analyses
          run on our servers, so an internet connection is required. Check your connection and try
          again; if it persists, email us with the time of the attempt.
        </p>
        <p>
          <span className="font-semibold text-[#F2FBF5]">Camera or photo access is not working.</span>{" "}
          Open Settings &gt; CyrusGuard AI and enable Camera or Photos. Both are optional — you can
          always paste text instead.
        </p>
      </Section>

      <Section heading="Account and data requests">
        <p>
          Signing in is optional. If you signed in with Apple, you can permanently delete that
          identity and all your data from Profile &gt; Delete Account inside the app. You can also
          email us and we will process the request. See{" "}
          <a href="/privacy-choices" className="text-[#2FF07A] hover:underline">
            Privacy Choices
          </a>{" "}
          for the full list of requests we handle.
        </p>
      </Section>
    </SiteLayout>
  );
}
