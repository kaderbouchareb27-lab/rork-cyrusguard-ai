import SwiftUI

/// Animated circular risk gauge, 0 to 100.
struct RiskGaugeView: View {
    let score: Int
    let level: RiskLevel
    let caption: String
    var size: CGFloat = 190

    @State private var animatedFraction: CGFloat = 0

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.07), lineWidth: size * 0.075)

            Circle()
                .trim(from: 0, to: animatedFraction)
                .stroke(
                    AngularGradient(
                        colors: [level.tint.opacity(0.55), level.tint],
                        center: .center
                    ),
                    style: StrokeStyle(lineWidth: size * 0.075, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .shadow(color: level.tint.opacity(0.5), radius: 10)

            VStack(spacing: 2) {
                Text("\(score)")
                    .font(.system(size: size * 0.28, weight: .bold, design: .rounded))
                    .foregroundStyle(GuardTheme.textPrimary)
                    .contentTransition(.numericText())
                Text("/100")
                    .font(.system(size: size * 0.085, weight: .semibold))
                    .foregroundStyle(GuardTheme.textMuted)
                Text(caption.uppercased())
                    .font(.system(size: size * 0.062, weight: .bold))
                    .kerning(1.1)
                    .foregroundStyle(level.tint)
                    .padding(.top, 4)
            }
        }
        .frame(width: size, height: size)
        .onAppear {
            withAnimation(.spring(response: 1.1, dampingFraction: 0.75)) {
                animatedFraction = CGFloat(score) / 100
            }
        }
    }
}
