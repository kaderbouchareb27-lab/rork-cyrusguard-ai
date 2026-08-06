import Foundation

/// Decoded payload returned by the Cyrus analysis model. Decoded off the main actor.
nonisolated struct ScanAnalysis: Codable, Sendable {
    let riskScore: Int
    let sourceType: ScanSource
    let detectedSource: String
    let detectedSourceEn: String
    let summary: String
    let summaryEn: String
    let explanation: String
    let explanationEn: String
    let suspiciousElements: [String]
    let suspiciousElementsEn: [String]
    let reassuringElements: [String]
    let reassuringElementsEn: [String]
    let advice: [String]
    let adviceEn: [String]

    var riskLevel: RiskLevel { RiskLevel(score: riskScore) }

    private enum CodingKeys: String, CodingKey {
        case riskScore, sourceType, detectedSource, detectedSourceEn
        case summary, summaryEn, explanation, explanationEn
        case suspiciousElements, suspiciousElementsEn
        case reassuringElements, reassuringElementsEn
        case advice, adviceEn
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let rawScore = try c.decodeIfPresent(Int.self, forKey: .riskScore) ?? 0
        riskScore = min(100, max(0, rawScore))
        sourceType = (try? c.decode(ScanSource.self, forKey: .sourceType)) ?? .unknown
        detectedSource = try c.decodeIfPresent(String.self, forKey: .detectedSource) ?? ""
        detectedSourceEn = try c.decodeIfPresent(String.self, forKey: .detectedSourceEn) ?? ""
        summary = try c.decodeIfPresent(String.self, forKey: .summary) ?? ""
        summaryEn = try c.decodeIfPresent(String.self, forKey: .summaryEn) ?? ""
        explanation = try c.decodeIfPresent(String.self, forKey: .explanation) ?? ""
        explanationEn = try c.decodeIfPresent(String.self, forKey: .explanationEn) ?? ""
        suspiciousElements = try c.decodeIfPresent([String].self, forKey: .suspiciousElements) ?? []
        suspiciousElementsEn = try c.decodeIfPresent([String].self, forKey: .suspiciousElementsEn) ?? []
        reassuringElements = try c.decodeIfPresent([String].self, forKey: .reassuringElements) ?? []
        reassuringElementsEn = try c.decodeIfPresent([String].self, forKey: .reassuringElementsEn) ?? []
        advice = try c.decodeIfPresent([String].self, forKey: .advice) ?? []
        adviceEn = try c.decodeIfPresent([String].self, forKey: .adviceEn) ?? []
    }
}

/// Errors surfaced to the UI with user-friendly copy.
nonisolated enum CyrusError: LocalizedError, Sendable {
    case noImage
    case emptyResponse
    case badJSON
    case network
    case server(Int)

    func message(french: Bool) -> String {
        switch self {
        case .noImage:
            return french
                ? "Impossible de lire cette capture. Essayez-en une autre."
                : "Could not read this screenshot. Please try another one."
        case .emptyResponse:
            return french
                ? "Cyrus n'a rien pu analyser. Réessayez dans un instant."
                : "Cyrus could not analyze this. Please try again shortly."
        case .badJSON:
            return french
                ? "Réponse invalide du service d'analyse. Réessayez."
                : "Invalid response from the analysis service. Please try again."
        case .network:
            return french
                ? "Vérifiez votre connexion Internet et réessayez."
                : "Check your Internet connection and try again."
        case .server(let code):
            if code == 429 {
                return french
                    ? "Service très sollicité. Patientez un moment et réessayez."
                    : "Service is busy. Please wait a moment and try again."
            }
            return french
                ? "Le service d'analyse est temporairement indisponible."
                : "The analysis service is temporarily unavailable."
        }
    }
}
