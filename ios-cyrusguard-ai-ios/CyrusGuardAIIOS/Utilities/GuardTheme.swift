import SwiftUI

/// Central design tokens for CyrusGuard: deep forest canvas with neon guardian green.
enum GuardTheme {
    static let canvas = Color(red: 0.024, green: 0.067, blue: 0.051)
    static let canvasDeep = Color(red: 0.012, green: 0.039, blue: 0.031)
    static let surface = Color(red: 0.043, green: 0.110, blue: 0.082)
    static let accent = Color(red: 0.286, green: 0.820, blue: 0.490)
    static let accentLight = Color(red: 0.569, green: 0.949, blue: 0.718)
    static let accentDeep = Color(red: 0.102, green: 0.541, blue: 0.290)
    static let danger = Color(red: 0.937, green: 0.267, blue: 0.267)
    static let warning = Color(red: 0.961, green: 0.620, blue: 0.043)
    static let textPrimary = Color(red: 0.925, green: 0.973, blue: 0.945)
    static let textMuted = Color(red: 0.549, green: 0.639, blue: 0.596)

    static let cardStroke = Color.white.opacity(0.06)
    static let accentStroke = Color(red: 0.286, green: 0.820, blue: 0.490).opacity(0.28)
}
