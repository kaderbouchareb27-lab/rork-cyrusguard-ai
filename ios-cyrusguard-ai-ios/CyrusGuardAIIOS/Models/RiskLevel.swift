import SwiftUI

/// Verdict bucket derived from the 0-100 risk score.
nonisolated enum RiskLevel: String, Codable, Sendable, CaseIterable {
    case low
    case medium
    case high

    init(score: Int) {
        switch score {
        case ..<40: self = .low
        case 40..<70: self = .medium
        default: self = .high
        }
    }

    var tint: Color {
        switch self {
        case .low: return GuardTheme.accent
        case .medium: return GuardTheme.warning
        case .high: return GuardTheme.danger
        }
    }

    var symbol: String {
        switch self {
        case .low: return "checkmark.shield.fill"
        case .medium: return "exclamationmark.triangle.fill"
        case .high: return "xmark.shield.fill"
        }
    }

    func title(french: Bool) -> String {
        switch self {
        case .low: return french ? "Semble sécuritaire" : "Looks safe"
        case .medium: return french ? "Méfiance conseillée" : "Be careful"
        case .high: return french ? "Arnaque détectée" : "Scam detected"
        }
    }

    func shortLabel(french: Bool) -> String {
        switch self {
        case .low: return french ? "Faible" : "Low"
        case .medium: return french ? "Moyen" : "Medium"
        case .high: return french ? "Élevé" : "High"
        }
    }
}
