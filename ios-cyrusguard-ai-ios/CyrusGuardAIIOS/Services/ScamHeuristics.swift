import Foundation

/// Offline scam scoring for text messages.
///
/// This runs with no network access so it can also be used by the SMS filter
/// extension, which iOS launches in a sandbox without internet permission.
nonisolated struct ScamHeuristics: Sendable {
    static let shared = ScamHeuristics()

    nonisolated struct Verdict: Sendable {
        let score: Int
        let matchedSignals: [String]

        var level: RiskLevel { RiskLevel(score: score) }
        var isJunk: Bool { score >= 70 }
    }

    /// Weighted phrases that repeatedly show up in fraudulent texts (FR + EN).
    private static let weightedSignals: [(weight: Int, label: String, patterns: [String])] = [
        (26, "Faux avis de livraison", [
            "colis", "livraison", "parcel", "delivery", "shipment", "douane", "customs",
            "frais de port", "shipping fee", "suivi de colis", "tracking number",
        ]),
        (26, "Faux remboursement ou dette", [
            "remboursement", "refund", "trop-perçu", "trop percu", "rembourser",
            "crédit d'impôt", "credit d'impot", "tax refund", "dette", "amende", "fine to pay",
        ]),
        (30, "Usurpation bancaire", [
            "votre compte a été suspendu", "compte suspendu", "account suspended",
            "carte bloquée", "carte bloquee", "card blocked", "activité inhabituelle",
            "unusual activity", "vérifier votre identité", "verifier votre identite",
            "verify your identity", "réactiver votre compte", "reactiver votre compte",
        ]),
        (24, "Urgence artificielle", [
            "immédiatement", "immediatement", "immediately", "dans les 24 heures",
            "within 24 hours", "dernier avertissement", "final warning", "urgent",
            "expire aujourd'hui", "expires today", "agir maintenant", "act now",
        ]),
        (22, "Demande de paiement inhabituel", [
            "carte cadeau", "gift card", "bitcoin", "crypto", "virement interac",
            "interac e-transfer", "western union", "moneygram", "recharge paysafe",
        ]),
        (20, "Faux gain ou cadeau", [
            "vous avez gagné", "vous avez gagne", "you have won", "félicitations",
            "felicitations", "congratulations", "iphone gratuit", "free iphone",
            "tirage au sort", "prize draw", "cadeau exclusif",
        ]),
        (18, "Identifiants demandés", [
            "mot de passe", "password", "code de vérification", "code de verification",
            "verification code", "nip", "code pin", "numéro d'assurance sociale",
            "numero d'assurance sociale", "social security", "numéro de carte",
            "numero de carte", "card number",
        ]),
        (16, "Lien raccourci ou douteux", [
            "bit.ly", "tinyurl", "cutt.ly", "is.gd", "t.co/", "rb.gy", "shorturl",
            "rebrand.ly", "s.id", "lnkd.in",
        ]),
        (14, "Approche par inconnu", [
            "je suis désolé, qui êtes-vous", "wrong number", "mauvais numéro",
            "opportunité d'investissement", "opportunite d'investissement",
            "investment opportunity", "revenus passifs", "passive income",
            "travail à domicile", "travail a domicile", "work from home",
        ]),
        (12, "Menace ou intimidation", [
            "poursuite judiciaire", "legal action", "mandat d'arrêt", "mandat d'arret",
            "arrest warrant", "votre ligne sera coupée", "service will be terminated",
            "compte sera fermé", "account will be closed",
        ]),
    ]

    /// Top level domains almost never used by legitimate senders in an SMS.
    private static let suspiciousTLDs: Set<String> = [
        "xyz", "top", "click", "buzz", "tk", "ml", "ga", "cf", "gq", "pw",
        "icu", "rest", "monster", "quest", "sbs", "cyou", "lol", "bond", "cc",
    ]

    func evaluate(body: String, sender: String?) -> Verdict {
        let text = body.lowercased()
        guard !text.isEmpty else { return Verdict(score: 0, matchedSignals: []) }

        var score = 0
        var signals: [String] = []

        for group in Self.weightedSignals {
            if group.patterns.contains(where: { text.contains($0) }) {
                score += group.weight
                signals.append(group.label)
            }
        }

        let links = Self.extractDomains(from: text)
        if !links.isEmpty {
            // A link plus any social-engineering signal is the classic scam shape.
            if !signals.isEmpty {
                score += 14
                signals.append("Lien combiné à un message alarmant")
            }
            for domain in links {
                if let tld = domain.split(separator: ".").last,
                   Self.suspiciousTLDs.contains(String(tld)) {
                    score += 24
                    signals.append("Domaine en .\(tld)")
                    break
                }
            }
            if links.contains(where: { $0.filter(\.isNumber).count >= 4 }) {
                score += 12
                signals.append("Domaine truffé de chiffres")
            }
        }

        if let sender, Self.looksLikeUnknownForeignNumber(sender) {
            score += 10
            signals.append("Expéditeur inconnu ou étranger")
        }

        return Verdict(score: min(100, score), matchedSignals: signals)
    }

    private static func extractDomains(from text: String) -> [String] {
        var domains: [String] = []
        let tokens = text.split { $0 == " " || $0 == "\n" || $0 == "\t" }
        for token in tokens {
            let cleaned = token.trimmingCharacters(in: CharacterSet(charactersIn: "()[]<>,;:!?\"'"))
            guard cleaned.contains(".") else { continue }
            var candidate = cleaned
            for prefix in ["https://", "http://"] where candidate.hasPrefix(prefix) {
                candidate = String(candidate.dropFirst(prefix.count))
            }
            candidate = String(candidate.split(separator: "/").first ?? "")
            if candidate.hasPrefix("www.") { candidate = String(candidate.dropFirst(4)) }
            let parts = candidate.split(separator: ".")
            if parts.count >= 2, parts.allSatisfy({ !$0.isEmpty }), candidate.count > 4 {
                domains.append(candidate)
            }
        }
        return domains
    }

    private static func looksLikeUnknownForeignNumber(_ sender: String) -> Bool {
        let digits = sender.filter(\.isNumber)
        guard digits.count >= 8 else { return false }
        // Short codes are usually legitimate carriers or banks.
        if digits.count <= 6 { return false }
        return sender.hasPrefix("+") && !sender.hasPrefix("+1") && !sender.hasPrefix("+33")
    }
}
