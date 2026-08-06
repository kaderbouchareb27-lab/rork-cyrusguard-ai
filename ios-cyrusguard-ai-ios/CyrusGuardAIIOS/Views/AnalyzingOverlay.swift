import SwiftUI

/// Shared "Cyrus is working" state with a live progress bar.
struct AnalyzingOverlay: View {
    let title: String
    let subtitle: String
    let progress: Double

    var body: some View {
        VStack(spacing: 22) {
            GuardianMarkView(size: 132)

            Text(title)
                .font(.system(size: 19, weight: .bold, design: .rounded))
                .foregroundStyle(GuardTheme.textPrimary)

            ProgressView(value: min(progress, 1))
                .progressViewStyle(.linear)
                .tint(GuardTheme.accent)
                .frame(maxWidth: 240)

            Text(subtitle)
                .font(.system(size: 13))
                .foregroundStyle(GuardTheme.textMuted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
