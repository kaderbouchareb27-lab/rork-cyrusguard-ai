import SwiftUI

/// Reusable elevated panel with the CyrusGuard border treatment.
struct SectionCard<Content: View>: View {
    let title: String?
    let symbol: String?
    var tint: Color = GuardTheme.accent
    @ViewBuilder let content: Content

    init(
        title: String? = nil,
        symbol: String? = nil,
        tint: Color = GuardTheme.accent,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.symbol = symbol
        self.tint = tint
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let title {
                HStack(spacing: 7) {
                    if let symbol {
                        Image(systemName: symbol)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(tint)
                    }
                    Text(title.uppercased())
                        .font(.system(size: 11.5, weight: .bold))
                        .kerning(1.1)
                        .foregroundStyle(tint)
                }
            }
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(GuardTheme.surface.opacity(0.75), in: .rect(cornerRadius: 20))
        .overlay {
            RoundedRectangle(cornerRadius: 20)
                .strokeBorder(GuardTheme.cardStroke, lineWidth: 1)
        }
    }
}

/// A bulleted line used for suspicious signals, reassuring signals and advice.
struct SignalRow: View {
    let text: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: symbol)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(tint)
                .frame(width: 18)
                .padding(.top, 2)
            Text(text)
                .font(.system(size: 14))
                .foregroundStyle(GuardTheme.textPrimary.opacity(0.92))
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
