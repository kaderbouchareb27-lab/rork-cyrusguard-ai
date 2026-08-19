import SiteLayout, { Section, Bullets } from "@/components/SiteLayout";

export default function Privacy() {
  return (
    <SiteLayout
      title="Privacy Policy"
      subtitle="Effective date: 19 August 2026. This policy explains what CyrusGuard AI collects, why, and how you can have it deleted."
    >
      <Section heading="Who we are">
        <p>
          CyrusGuard AI (the &quot;app&quot;) is operated from 1055 Rue Lucien-L&apos;Allier, Unit
          #1036, Montreal, QC H3G 3C4, Canada. For any privacy question or request, email{" "}
          <a href="mailto:support@cyrusguard.ai" className="text-[#2FF07A] hover:underline">
            support@cyrusguard.ai
          </a>
          .
        </p>
      </Section>

      <Section heading="No account is required">
        <p>
          You can subscribe and use every feature without creating an account. We do not ask for your
          name, email address, or phone number. Signing in with Apple is entirely optional.
        </p>
      </Section>

      <Section heading="What we collect and why">
        <p className="font-semibold text-[#F2FBF5]">Content you submit for analysis</p>
        <p>
          When you analyze a message, a screenshot, or a web address, that content is sent over an
          encrypted HTTPS connection to our AI analysis provider so a risk score and explanation can
          be produced. This content is processed to answer your request and is not used to build a
          profile of you or to send you marketing.
        </p>

        <p className="font-semibold text-[#F2FBF5]">Your scan history</p>
        <p>
          Your past analyses are stored locally on your device so you can review them. They are not
          uploaded to a CyrusGuard server and are erased when you delete the app or use Delete
          Account.
        </p>

        <p className="font-semibold text-[#F2FBF5]">Subscription data</p>
        <p>
          Our payments partner RevenueCat receives an anonymous identifier and your Apple purchase
          receipt so the app can tell whether your subscription is active. We never receive your
          credit card number — Apple processes the payment.
        </p>

        <p className="font-semibold text-[#F2FBF5]">Optional Apple sign-in</p>
        <p>
          If you choose Sign in with Apple, the app stores the identifier Apple gives it, plus the
          name and email you agree to share, on your device and links them to your subscription. You
          can hide your real email using Apple&apos;s Private Relay.
        </p>

        <p className="font-semibold text-[#F2FBF5]">Camera and photos</p>
        <p>
          Camera and photo library access are requested only at the moment you choose to scan a photo
          or a screenshot. We do not browse your photo library, and we only receive the single image
          you pick.
        </p>
      </Section>

      <Section heading="What we do not do">
        <Bullets
          items={[
            "We do not sell your personal data.",
            "We do not share your data with data brokers or advertisers.",
            "We do not track you across other companies' apps or websites.",
            "We do not show advertising in the app.",
            "We do not read your messages, contacts, call history, or emails in the background — only what you explicitly submit.",
          ]}
        />
      </Section>

      <Section heading="Service providers">
        <Bullets
          items={[
            "Apple — App Store distribution, payment processing, and optional Sign in with Apple.",
            "RevenueCat — subscription entitlement management.",
            "Our AI analysis provider — processes the content you submit to generate a risk score, over an encrypted connection.",
          ]}
        />
        <p>
          These providers may process data outside your country, including in the United States.
          Where required, transfers rely on standard contractual clauses or an equivalent safeguard.
        </p>
      </Section>

      <Section heading="Retention and deletion">
        <p>
          Your scan history lives on your device for as long as you keep it. Content sent for
          analysis is retained by the analysis provider only as long as needed to return your result
          and to prevent abuse. Deleting the app removes all local data. Delete Account, inside the
          app, additionally erases the optional Apple sign-in identity.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export, or delete
          your personal data, and to object to certain processing. Because we hold almost no
          personally identifying information, most of these rights are exercised directly on your
          device. See{" "}
          <a href="/privacy-choices" className="text-[#2FF07A] hover:underline">
            Privacy Choices
          </a>{" "}
          for how to make a request, or email us.
        </p>
      </Section>

      <Section heading="Children">
        <p>
          CyrusGuard AI is not directed at children under 13, and we do not knowingly collect their
          personal data. If you believe a child has provided us data, contact us and we will delete
          it.
        </p>
      </Section>

      <Section heading="Security">
        <p>
          All network traffic uses HTTPS/TLS. Analyses stay on your device unless you actively submit
          them. Please note that no method of transmission or storage is completely secure.
        </p>
      </Section>

      <Section heading="Important limitation">
        <p>
          CyrusGuard AI provides an automated opinion about how risky a message or website appears.
          It can be wrong in either direction. Always use your own judgement and never rely on the
          app alone for a financial or security decision.
        </p>
      </Section>

      <Section heading="Changes to this policy">
        <p>
          We may update this policy. The effective date at the top will change and, when the update
          is significant, we will tell you inside the app.
        </p>
      </Section>
    </SiteLayout>
  );
}
