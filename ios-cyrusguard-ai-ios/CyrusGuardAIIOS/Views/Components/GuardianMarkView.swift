import SwiftUI

/// The CyrusGuard emblem: a guardian ring with a sweeping scan beam.
struct GuardianMarkView: View {
    let size: CGFloat
    var animated: Bool = true

    @State private var beamOffset: CGFloat = -1
    @State private var ringPulse: CGFloat = 1

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [GuardTheme.accent.opacity(0.22), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: size * 0.62
                    )
                )
                .scaleEffect(ringPulse)

            Circle()
                .fill(GuardTheme.canvasDeep)
                .overlay {
                    Circle().strokeBorder(GuardTheme.accent.opacity(0.35), lineWidth: 1.2)
                }
                .frame(width: size * 0.84, height: size * 0.84)

            Circle()
                .trim(from: 0.08, to: 0.92)
                .stroke(
                    AngularGradient(
                        colors: [GuardTheme.accent, GuardTheme.accentLight, GuardTheme.accentDeep, GuardTheme.accent],
                        center: .center
                    ),
                    style: StrokeStyle(lineWidth: size * 0.055, lineCap: .round)
                )
                .rotationEffect(.degrees(128))
                .frame(width: size * 0.9, height: size * 0.9)

            Image(systemName: "shield.lefthalf.filled")
                .font(.system(size: size * 0.34, weight: .semibold))
                .foregroundStyle(
                    LinearGradient(
                        colors: [GuardTheme.accentLight, GuardTheme.accent],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )

            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [.clear, GuardTheme.accentLight, .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(width: size * 0.95, height: 1.6)
                .shadow(color: GuardTheme.accent.opacity(0.9), radius: 6)
                .offset(y: beamOffset * size * 0.34)
                .mask(Circle().frame(width: size * 0.9, height: size * 0.9))
        }
        .frame(width: size, height: size)
        .onAppear {
            guard animated else { return }
            withAnimation(.easeInOut(duration: 2.1).repeatForever(autoreverses: true)) {
                beamOffset = 1
            }
            withAnimation(.easeInOut(duration: 2.6).repeatForever(autoreverses: true)) {
                ringPulse = 1.12
            }
        }
    }
}
