import SwiftUI
import SwiftData
import PhotosUI

/// Screenshot analysis: the user imports any screenshot and Cyrus figures out the rest.
struct ScreenshotAnalysisView: View {
    @Environment(LanguageStore.self) private var lang
    @Environment(\.modelContext) private var context
    @State private var viewModel = AnalysisViewModel()
    @State private var pickedItem: PhotosPickerItem?

    var body: some View {
        ZStack {
            GuardBackdrop()

            if viewModel.isBusy {
                AnalyzingOverlay(
                    title: lang.tr("Cyrus analyse votre capture", "Cyrus is reading your screenshot"),
                    subtitle: lang.tr(
                        "Lecture du texte, identification de la source, recherche des signaux de fraude.",
                        "Reading the text, identifying the source, looking for fraud signals."
                    ),
                    progress: viewModel.progress
                )
            } else {
                content
            }
        }
        .navigationTitle(lang.tr("Analyse de capture", "Screenshot analysis"))
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: pickedItem) { _, newValue in
            guard let newValue else { return }
            Task {
                await viewModel.analyze(item: newValue, context: context, french: lang.isFrench)
                pickedItem = nil
            }
        }
        .sheet(item: $viewModel.latestRecord) { record in
            NavigationStack {
                ResultDetailView(record: record)
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button(lang.tr("Fermer", "Close")) { viewModel.reset() }
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
                    GuardianMarkView(size: 118)
                    Text(lang.tr("Confiez le doute à Cyrus.", "Give Cyrus the doubt."))
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundStyle(GuardTheme.textPrimary)
                    Text(lang.tr(
                        "Importez la capture d'écran d'un message, d'une annonce, d'un courriel ou d'un appel suspect.",
                        "Import a screenshot of a suspicious message, ad, email or call."
                    ))
                    .font(.system(size: 14))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(GuardTheme.textMuted)
                    .padding(.horizontal, 20)
                }
                .padding(.top, 4)

                PhotosPicker(
                    selection: $pickedItem,
                    matching: .images,
                    photoLibrary: .shared()
                ) {
                    HStack(spacing: 12) {
                        Image(systemName: "photo.badge.plus.fill")
                            .font(.system(size: 19, weight: .semibold))
                        Text(lang.tr("Importer une capture d'écran", "Import a screenshot"))
                            .font(.system(size: 16, weight: .bold))
                    }
                    .foregroundStyle(GuardTheme.canvasDeep)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 17)
                    .background(
                        LinearGradient(
                            colors: [GuardTheme.accentLight, GuardTheme.accent],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        in: .rect(cornerRadius: 18)
                    )
                    .shadow(color: GuardTheme.accent.opacity(0.35), radius: 14, y: 6)
                }
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

                SectionCard(title: lang.tr("Cyrus reconnaît", "Cyrus recognizes"), symbol: "eye.fill") {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(Self.recognisedSources, id: \.symbol) { item in
                            SignalRow(
                                text: lang.tr(item.fr, item.en),
                                symbol: item.symbol,
                                tint: GuardTheme.accent
                            )
                        }
                    }
                }

                Text(lang.tr(
                    "Vos captures sont analysées puis conservées uniquement sur votre iPhone.",
                    "Your screenshots are analyzed and kept only on your iPhone."
                ))
                .font(.system(size: 11.5))
                .foregroundStyle(GuardTheme.textMuted)
                .multilineTextAlignment(.center)
            }
            .padding(.horizontal)
            .padding(.bottom, 32)
        }
    }

    private static let recognisedSources: [(symbol: String, fr: String, en: String)] = [
        ("message.fill", "SMS et textos : faux avis de livraison, faux remboursements, fraudes bancaires", "Text messages: fake delivery notices, fake refunds, bank fraud"),
        ("envelope.fill", "Courriels : hameçonnage, fausses factures, faux renouvellements", "Emails: phishing, fake invoices, fake renewals"),
        ("bubble.left.and.bubble.right.fill", "WhatsApp : mauvais numéro, placements crypto, faux proches", "WhatsApp: wrong number, crypto pitches, fake relatives"),
        ("megaphone.fill", "Annonces et pages Facebook : fausses boutiques, rabais impossibles, faux concours", "Facebook ads and pages: fake stores, impossible discounts, fake contests"),
        ("person.2.fill", "Messenger et Instagram : comptes piratés, arnaques amoureuses", "Messenger and Instagram: hacked accounts, romance scams"),
        ("tag.fill", "Marketplace et petites annonces : faux vendeurs, demandes de dépôt", "Marketplace and classifieds: fake sellers, deposit requests"),
        ("phone.fill", "Appels et messagerie vocale : numéros usurpés, faux soutien technique", "Calls and voicemail: spoofed numbers, fake tech support"),
        ("briefcase.fill", "Offres d'emploi : faux recruteurs, réexpédition de colis", "Job offers: fake recruiters, parcel reshipping"),
    ]
}
