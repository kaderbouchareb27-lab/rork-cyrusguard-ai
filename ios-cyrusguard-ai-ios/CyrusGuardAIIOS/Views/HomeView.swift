import SwiftUI
import SwiftData

/// Landing screen: brand hero, the two analysis entry points, shield status and recent verdicts.
struct HomeView: View {
    @Environment(LanguageStore.self) private var lang
    @Query(sort: \ScanRecord.createdAt, order: .reverse) private var records: [ScanRecord]

    private var recent: [ScanRecord] { Array(records.prefix(3)) }

    var body: some View {
        ZStack {
            GuardBackdrop()

            ScrollView {
                VStack(spacing: 18) {
                    brandBar
                    hero
                    actions
                    shieldPromo

                    if !recent.isEmpty {
                        recentSection
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 32)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    ForEach(AppLanguage.allCases) { option in
                        Button {
                            lang.language = option
                        } label: {
                            HStack {
                                Text(option.label)
                                if lang.language == option {
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    }
                } label: {
                    Image(systemName: "globe")
                        .foregroundStyle(GuardTheme.accent)
                }
            }
        }
    }

    private var brandBar: some View {
        HStack {
            HStack(spacing: 6) {
                Circle()
                    .fill(GuardTheme.accent)
                    .frame(width: 6, height: 6)
                Text(lang.tr("RÉSEAU DE PROTECTION", "PROTECTION NETWORK"))
                    .font(.system(size: 10, weight: .bold))
                    .kerning(1.2)
            }
            .foregroundStyle(GuardTheme.accentLight)

            Spacer()

            Text("AI · 1.0")
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(GuardTheme.textMuted)
        }
        .padding(.top, 4)
    }

    private var hero: some View {
        VStack(spacing: 14) {
            GuardianMarkView(size: 138)

            Text("CyrusGuard")
                .font(.system(size: 30, weight: .bold, design: .rounded))
                .foregroundStyle(GuardTheme.textPrimary)

            Text(lang.tr(
                "Détectez la fraude avant qu'elle ne vous atteigne.",
                "Spot fraud before it reaches you."
            ))
            .font(.system(size: 14.5))
            .foregroundStyle(GuardTheme.textMuted)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 26)
        .background {
            RoundedRectangle(cornerRadius: 26)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.090, green: 0.239, blue: 0.165),
                            GuardTheme.canvasDeep,
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        }
        .overlay {
            RoundedRectangle(cornerRadius: 26)
                .strokeBorder(GuardTheme.accentStroke, lineWidth: 1)
        }
    }

    private var actions: some View {
        HStack(spacing: 12) {
            NavigationLink(value: HomeRoute.screenshot) {
                ActionTile(
                    symbol: "photo.badge.magnifyingglass",
                    title: lang.tr("Analyser une capture", "Analyze a screenshot"),
                    hint: lang.tr("SMS · WhatsApp · Facebook", "SMS · WhatsApp · Facebook"),
                    tint: GuardTheme.accent
                )
            }
            .buttonStyle(.plain)

            NavigationLink(value: HomeRoute.link) {
                ActionTile(
                    symbol: "link.badge.plus",
                    title: lang.tr("Analyser un lien", "Analyze a link"),
                    hint: lang.tr("Site web · URL suspecte", "Website · Suspicious URL"),
                    tint: Color(red: 0.231, green: 0.510, blue: 0.965)
                )
            }
            .buttonStyle(.plain)
        }
    }

    private var shieldPromo: some View {
        NavigationLink(value: HomeRoute.shield) {
            HStack(spacing: 13) {
                Image(systemName: "bolt.shield.fill")
                    .font(.system(size: 21, weight: .semibold))
                    .foregroundStyle(GuardTheme.accent)
                    .frame(width: 44, height: 44)
                    .background(GuardTheme.accent.opacity(0.13), in: .rect(cornerRadius: 13))

                VStack(alignment: .leading, spacing: 3) {
                    Text(lang.tr("Bouclier SMS", "SMS shield"))
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(GuardTheme.textPrimary)
                    Text(lang.tr(
                        "Laissez Cyrus filtrer les textos d'inconnus en continu",
                        "Let Cyrus filter texts from unknown senders around the clock"
                    ))
                    .font(.system(size: 12))
                    .foregroundStyle(GuardTheme.textMuted)
                    .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: 4)

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(GuardTheme.textMuted)
            }
            .padding(15)
            .background(GuardTheme.surface.opacity(0.75), in: .rect(cornerRadius: 20))
            .overlay {
                RoundedRectangle(cornerRadius: 20)
                    .strokeBorder(GuardTheme.accentStroke, lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
    }

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(lang.tr("ANALYSES RÉCENTES", "RECENT ANALYSES"))
                    .font(.system(size: 11, weight: .bold))
                    .kerning(1.1)
                    .foregroundStyle(GuardTheme.accentLight)
                Spacer()
                NavigationLink(value: HomeRoute.history) {
                    Text(lang.tr("Tout voir", "See all"))
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(GuardTheme.accent)
                }
            }

            ForEach(recent) { record in
                NavigationLink(value: record) {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(record.riskLevel.tint.opacity(0.15))
                            Text("\(record.riskScore)")
                                .font(.system(size: 14, weight: .bold, design: .rounded))
                                .foregroundStyle(record.riskLevel.tint)
                        }
                        .frame(width: 42, height: 42)

                        VStack(alignment: .leading, spacing: 3) {
                            Text(record.detectedSourceText(french: lang.isFrench))
                                .font(.system(size: 11.5, weight: .semibold))
                                .foregroundStyle(GuardTheme.accentLight)
                                .lineLimit(1)
                            Text(record.summaryText(french: lang.isFrench))
                                .font(.system(size: 13))
                                .foregroundStyle(GuardTheme.textPrimary.opacity(0.9))
                                .lineLimit(2)
                                .multilineTextAlignment(.leading)
                        }

                        Spacer(minLength: 4)

                        Image(systemName: "chevron.right")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(GuardTheme.textMuted)
                    }
                    .padding(13)
                    .background(GuardTheme.surface.opacity(0.7), in: .rect(cornerRadius: 16))
                }
                .buttonStyle(.plain)
            }
        }
    }
}

/// Destinations reachable from the home screen.
enum HomeRoute: Hashable {
    case screenshot
    case link
    case shield
    case history
}

private struct ActionTile: View {
    let symbol: String
    let title: String
    let hint: String
    let tint: Color

    var body: some View {
        VStack(spacing: 9) {
            Image(systemName: symbol)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(tint)
                .frame(width: 48, height: 48)
                .background(tint.opacity(0.13), in: .rect(cornerRadius: 14))

            Text(title)
                .font(.system(size: 13.5, weight: .bold))
                .foregroundStyle(GuardTheme.textPrimary)
                .multilineTextAlignment(.center)

            Text(hint)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(GuardTheme.textMuted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
        .padding(.horizontal, 10)
        .background(GuardTheme.surface.opacity(0.75), in: .rect(cornerRadius: 20))
        .overlay {
            RoundedRectangle(cornerRadius: 20)
                .strokeBorder(GuardTheme.cardStroke, lineWidth: 1)
        }
    }
}
