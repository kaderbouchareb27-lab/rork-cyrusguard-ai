import Foundation

/// Where the analyzed content came from. Cyrus detects this itself from a screenshot.
nonisolated enum ScanSource: String, Codable, Sendable, CaseIterable {
    case sms
    case email
    case whatsapp
    case socialMessage
    case socialAd
    case marketplace
    case call
    case website
    case jobOffer
    case unknown

    var symbol: String {
        switch self {
        case .sms: return "message.fill"
        case .email: return "envelope.fill"
        case .whatsapp: return "bubble.left.and.bubble.right.fill"
        case .socialMessage: return "person.2.fill"
        case .socialAd: return "megaphone.fill"
        case .marketplace: return "tag.fill"
        case .call: return "phone.fill"
        case .website: return "globe"
        case .jobOffer: return "briefcase.fill"
        case .unknown: return "questionmark.circle.fill"
        }
    }

    func label(french: Bool) -> String {
        switch self {
        case .sms: return french ? "SMS / Texto" : "Text message"
        case .email: return french ? "Courriel" : "Email"
        case .whatsapp: return "WhatsApp"
        case .socialMessage: return french ? "Message privé" : "Direct message"
        case .socialAd: return french ? "Annonce / Publication" : "Ad / Post"
        case .marketplace: return french ? "Petite annonce" : "Marketplace listing"
        case .call: return french ? "Appel" : "Phone call"
        case .website: return french ? "Site web" : "Website"
        case .jobOffer: return french ? "Offre d'emploi" : "Job offer"
        case .unknown: return french ? "Source inconnue" : "Unknown source"
        }
    }
}
