import SwiftUI
import SwiftData

/// Link analysis: fetches the site, then asks Cyrus for a verdict on the evidence.
struct LinkAnalysisView: View {
    @Environment(LanguageStore.self) private var lang
    @Environment(\.modelContext) private var context
    @State private var viewModel = AnalysisViewModel()
    @State private var input: String = ""
    @FocusState private var isFieldFocused: Bool

    private var canSubmit: Bool {
        let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.count >= 4 && trimmed.contains(".")
    }

    var body: some View {
        ZStack {
            GuardBackdrop()

            if viewModel.isBusy {
                AnalyzingOverlay(
                    title: lang.tr("Cyrus inspecte le site", "Cyrus is inspecting the site"),
                    subtitle: lang.tr(
                        "Connexion au serveur, vérification du certificat, des mentions légales et de la réputation du domaine.",
                        "Connecting to the server, checking the certificate, legal pages and domain reputation."
                    ),
                    progress: viewModel.progress
                )
            } else {
                content
            }
        }
        .navigationTitle(lang.tr("Analyse de lien", "Link analysis"))
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $viewModel.latestRecord) { record in
            NavigationStack {
                ResultDetailView(record: record)
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button(lang.tr("Fermer", "Close")) {
                                viewModel.reset()
                                input = ""
                            }
                            .foregroundStyle(GuardTheme.accent)
                        }
                    }
            }
        }
    }

    private var content: some View {
        ScrollView {
            VStack(spacing: 18) {
                VStack(spacing: 12) {
                    GuardianMarkView(size: 110)
                    Text(lang.tr("Ce site est-il fiable ?", "Is this site trustworthy?"))
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundStyle(GuardTheme.textPrimary)
                    Text(lang.tr(
                        "Collez l'adresse d'une boutique ou d'un lien reçu par message avant d'y entrer vos informations.",
                        "Paste the address of a shop or a link you received before entering any of your details."
                    ))
                    .font(.system(size: 14))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(GuardTheme.textMuted)
                    .padding(.horizontal, 20)
                }
                .padding(.top, 4)

                SectionCard(title: lang.tr("Adresse à vérifier", "Address to check"), symbol: "link") {
                    TextField(
                        "",
                        text: $input,
                        prompt: Text(lang.tr("boutique-exemple.com", "example-shop.com"))
                            .foregroundStyle(GuardTheme.textMuted)
                    )
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .keyboardType(.URL)
                    .submitLabel(.go)
                    .focused($isFieldFocused)
                    .font(.system(size: 15, design: .monospaced))
                    .foregroundStyle(GuardTheme.textPrimary)
                    .padding(.vertical, 12)
                    .padding(.horizontal, 14)
                    .background(GuardTheme.canvasDeep.opacity(0.8), in: .rect(cornerRadius: 14))
                    .overlay {
                        RoundedRectangle(cornerRadius: 14)
                            .strokeBorder(
                                isFieldFocused ? GuardTheme.accentStroke : GuardTheme.cardStroke,
                                lineWidth: 1
                            )
                    }
                    .onSubmit(submit)
                }

                Button(action: submit) {
                    HStack(spacing: 10) {
                        Image(systemName: "shield.checkered")
                            .font(.system(size: 18, weight: .semibold))
                        Text(lang.tr("Vérifier ce lien", "Check this link"))
                            .font(.system(size: 16, weight: .bold))
                    }
                    .foregroundStyle(canSubmit ? GuardTheme.canvasDeep : GuardTheme.textMuted)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 17)
                    .background {
                        if canSubmit {
                            LinearGradient(
                                colors: [GuardTheme.accentLight, GuardTheme.accent],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        } else {
                            GuardTheme.surface
                        }
                    }
                    .clipShape(.rect(cornerRadius: 18))
                }
                .disabled(!canSubmit)
                .buttonStyle(.plain)

                if let message = viewModel.errorMessage {
                    SectionCard(
                        title: lang.tr("Erreur", "Error"),
                        symbol: "exclamationmark.triangle.fill",
                        tint: GuardTheme.danger
                    ) {
                        Text(message)
                            .font(.system(size: 14))
                            .foregroundStyle(GuardTheme.textPrimary.opacity(0.9))
                    }
                }

                SectionCard(title: lang.tr("Ce que Cyrus vérifie", "What Cyrus checks"), symbol: "checklist") {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(Self.checks, id: \.symbol) { item in
                            SignalRow(
                                text: lang.tr(item.fr, item.en),
                                symbol: item.symbol,
                                tint: GuardTheme.accent
                            )
                        }
                    }
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 32)
        }
        .scrollDismissesKeyboard(.interactively)
    }

    private func submit() {
        guard canSubmit, !viewModel.isBusy else { return }
        isFieldFocused = false
        Task {
            await viewModel.analyze(link: input, context: context, french: lang.isFrench)
        }
    }

    private static let checks: [(symbol: String, fr: String, en: String)] = [
        ("lock.fill", "La connexion sécurisée et le certificat du site", "The secure connection and the site certificate"),
        ("magnifyingglass", "Le domaine : imitation d'une marque connue, extension douteuse", "The domain: lookalike of a known brand, dubious extension"),
        ("doc.text.fill", "La présence de mentions légales et d'une politique de confidentialité", "Whether legal notices and a privacy policy exist"),
        ("person.crop.circle.badge.questionmark", "Les coordonnées de contact réelles de l'entreprise", "Real contact details for the business"),
        ("creditcard.fill", "Les demandes de paiement ou de données bancaires", "Requests for payment or banking details"),
        ("arrow.triangle.branch", "Les redirections vers un autre domaine", "Redirects toward another domain"),
    ]
}
