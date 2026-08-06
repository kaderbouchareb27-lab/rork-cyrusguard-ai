import Foundation
import SwiftUI

/// The two languages CyrusGuard ships with.
enum AppLanguage: String, CaseIterable, Identifiable, Sendable {
    case french = "fr"
    case english = "en"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .french: return "Français"
        case .english: return "English"
        }
    }

    /// Best guess from the device locale, used the very first time the app launches.
    static var deviceDefault: AppLanguage {
        let code = Locale.current.language.languageCode?.identifier.lowercased() ?? "fr"
        return code == "fr" ? .french : .english
    }
}

/// Holds the active language and exposes a compact bilingual helper.
@Observable
final class LanguageStore {
    var language: AppLanguage {
        didSet {
            guard oldValue != language else { return }
            UserDefaults.standard.set(language.rawValue, forKey: Self.storageKey)
        }
    }

    private static let storageKey = "cyrusguard.language"

    init() {
        if let stored = UserDefaults.standard.string(forKey: Self.storageKey),
           let parsed = AppLanguage(rawValue: stored) {
            language = parsed
        } else {
            language = AppLanguage.deviceDefault
        }
    }

    /// Picks the right string for the active language.
    func tr(_ fr: String, _ en: String) -> String {
        language == .french ? fr : en
    }

    var isFrench: Bool { language == .french }
}
