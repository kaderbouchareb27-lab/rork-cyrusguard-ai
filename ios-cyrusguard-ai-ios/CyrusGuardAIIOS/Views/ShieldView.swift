import SwiftUI

/// Passive protection: explains and monitors the CyrusGuard SMS filter that iOS
/// can hand unknown-sender messages to, plus a live demo of the offline engine.
struct ShieldView: View {
    @Environment(LanguageStore.self) private var lang
    @State private var demoText: String = ""
    @State private var demoVerdict: ScamHeuristics.Verdict?

    var body: some View {
        ZStack {
            GuardBackdrop()

            ScrollView {
                VStack(spacing: 18) {
                    header

                    SectionCard(
                        title: lang.tr("Comment l'activer", "How to turn it on"),
                        symbol: "gearshape.fill"
                    ) {
                        VStack(alignment: .leading, spacing: 12) {
                            ForEach(Array(Self.steps.enumerated()), id: \.offset) { index, step in
                                HStack(alignment: .top, spacing: 11) {
                                    Text("\(index + 1)")
                                        .font(.system(size: 12, weight: .bold, design: .rounded))
                                        .foregroundStyle(GuardTheme.canvasDeep)
                                        .frame(width: 22, height: 22)
                                        .background(GuardTheme.accent, in: .circle)
                                    Text(lang.tr(step.fr, step.en))
                                        .font(.system(size: 14))
                                        .foregroundStyle(GuardTheme.textPrimary.opacity(0.92))
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                            }

                            Button {
                                if let url = URL(string: UIApplication.openSettingsURLString) {
                                    UIApplication.shared.open(url)
                                }
                            } label: {
                                HStack(spacing: 8) {
                                    Image(systemName: "arrow.up.forward.app.fill")
                                    Text(lang.tr("Ouvrir les Réglages", "Open Settings"))
                                        .font(.system(size: 14, weight: .bold))
                                }
                                .foregroundStyle(GuardTheme.accent)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 13)
                                .background(GuardTheme.accent.opacity(0.12), in: .rect(cornerRadius: 14))
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    SectionCard(
                        title: lang.tr("Ce que fait le filtre", "What the filter does"),
                        symbol: "bolt.shield.fill"
                    ) {
                        VStack(alignment: .leading, spacing: 10) {
                            ForEach(Self.capabilities, id: \.symbol) { item in
                                SignalRow(
                                    text: lang.tr(item.fr, item.en),
                                    symbol: item.symbol,
                                    tint: GuardTheme.accent
                                )
                            }
                        }
                    }

                    demoCard

                    Text(lang.tr(
                        "Le filtre fonctionne hors ligne et ne voit jamais les messages de vos contacts. Aucun message ne quitte votre iPhone.",
                        "The filter works offline and never sees messages from your contacts. No message ever leaves your iPhone."
                    ))
                    .font(.system(size: 11.5))
                    .foregroundStyle(GuardTheme.textMuted)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)
                }
                .padding(.horizontal)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle(lang.tr("Bouclier SMS", "SMS shield"))
        .navigationBarTitleDisplayMode(.inline)
    }

    private var header: some View {
        VStack(spacing: 12) {
            GuardianMarkView(size: 112)
            Text(lang.tr("Protection permanente", "Always-on protection"))
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(GuardTheme.textPrimary)
            Text(lang.tr(
                "Activez le bouclier et iOS confie à Cyrus les textos venant de numéros inconnus. Les arnaques sont rangées automatiquement dans l'onglet Indésirables des Messages, avant même que vous les lisiez.",
                "Turn the shield on and iOS hands Cyrus the texts coming from unknown numbers. Scams are filed automatically into the Junk tab of Messages, before you even read them."
            ))
            .font(.system(size: 14))
            .lineSpacing(2)
            .multilineTextAlignment(.center)
            .foregroundStyle(GuardTheme.textMuted)
            .padding(.horizontal, 12)
        }
        .padding(.top, 4)
    }

    private var demoCard: some View {
        SectionCard(
            title: lang.tr("Essayez le moteur", "Try the engine"),
            symbol: "text.magnifyingglass",
            tint: GuardTheme.warning
        ) {
            VStack(alignment: .leading, spacing: 12) {
                Text(lang.tr(
                    "Collez un texto pour voir exactement le verdict que le filtre rendrait.",
                    "Paste a text message to see exactly the verdict the filter would return."
                ))
                .font(.system(size: 13))
                .foregroundStyle(GuardTheme.textMuted)

                TextEditor(text: $demoText)
                    .frame(height: 96)
                    .font(.system(size: 14))
                    .foregroundStyle(GuardTheme.textPrimary)
                    .scrollContentBackground(.hidden)
                    .padding(10)
                    .background(GuardTheme.canvasDeep.opacity(0.8), in: .rect(cornerRadius: 14))
                    .overlay {
                        RoundedRectangle(cornerRadius: 14)
                            .strokeBorder(GuardTheme.cardStroke, lineWidth: 1)
                    }

                Button {
                    demoVerdict = ScamHeuristics.shared.evaluate(body: demoText, sender: nil)
                } label: {
                    Text(lang.tr("Tester", "Test"))
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(GuardTheme.canvasDeep)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(GuardTheme.accent, in: .rect(cornerRadius: 14))
                }
                .buttonStyle(.plain)
                .disabled(demoText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                if let verdict = demoVerdict {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 8) {
                            Image(systemName: verdict.level.symbol)
                                .foregroundStyle(verdict.level.tint)
                            Text(verdict.isJunk
                                 ? lang.tr("Classé dans Indésirables", "Filed as Junk")
                                 : lang.tr("Laissé dans la boîte de réception", "Left in the inbox"))
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(verdict.level.tint)
                            Spacer()
                            Text("\(verdict.score)/100")
                                .font(.system(size: 13, weight: .semibold, design: .rounded))
                                .foregroundStyle(GuardTheme.textMuted)
                        }
                        if verdict.matchedSignals.isEmpty {
                            Text(lang.tr("Aucun signal d'arnaque détecté.", "No scam signal detected."))
                                .font(.system(size: 13))
                                .foregroundStyle(GuardTheme.textMuted)
                        } else {
                            ForEach(verdict.matchedSignals, id: \.self) { signal in
                                SignalRow(text: signal, symbol: "dot.radiowaves.left.and.right", tint: verdict.level.tint)
                            }
                        }
                    }
                    .padding(13)
                    .background(verdict.level.tint.opacity(0.09), in: .rect(cornerRadius: 14))
                }
            }
        }
    }

    private static let steps: [(fr: String, en: String)] = [
        (
            "Ouvrez Réglages, puis Apps et Messages.",
            "Open Settings, then Apps and Messages."
        ),
        (
            "Touchez « Filtrage des expéditeurs inconnus » et activez-le.",
            "Tap \"Unknown & Spam\" and turn filtering on."
        ),
        (
            "Choisissez CyrusGuard dans la liste des filtres SMS.",
            "Choose CyrusGuard from the list of SMS filters."
        ),
        (
            "C'est tout. Les textos d'inconnus passent maintenant par Cyrus automatiquement.",
            "That's it. Texts from unknown senders now go through Cyrus automatically."
        ),
    ]

    private static let capabilities: [(symbol: String, fr: String, en: String)] = [
        ("shippingbox.fill", "Détecte les faux avis de livraison et de douane", "Catches fake delivery and customs notices"),
        ("banknote.fill", "Repère les usurpations bancaires et les faux remboursements", "Spots bank impersonation and fake refunds"),
        ("link.badge.plus", "Signale les liens raccourcis et les domaines douteux", "Flags shortened links and dubious domains"),
        ("gift.fill", "Reconnaît les faux gains et les faux concours", "Recognises fake prizes and fake contests"),
        ("hourglass", "Détecte l'urgence artificielle et les menaces", "Detects artificial urgency and threats"),
        ("wifi.slash", "Fonctionne entièrement hors ligne, sans envoyer vos messages", "Works entirely offline, never sending your messages away"),
    ]
}
