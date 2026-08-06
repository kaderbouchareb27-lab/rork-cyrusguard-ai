import SwiftUI

/// Layered atmosphere used behind every screen: deep forest gradient plus two soft green orbs.
struct GuardBackdrop: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [GuardTheme.canvasDeep, GuardTheme.canvas, Color.black],
                startPoint: .top,
                endPoint: .bottom
            )

            Circle()
                .fill(
                    RadialGradient(
                        colors: [GuardTheme.accent.opacity(0.20), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 240
                    )
                )
                .frame(width: 460, height: 460)
                .offset(x: 150, y: -300)
                .blur(radius: 30)

            Circle()
                .fill(
                    RadialGradient(
                        colors: [GuardTheme.accentDeep.opacity(0.22), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 220
                    )
                )
                .frame(width: 400, height: 400)
                .offset(x: -160, y: 380)
                .blur(radius: 40)
        }
        .ignoresSafeArea()
    }
}
