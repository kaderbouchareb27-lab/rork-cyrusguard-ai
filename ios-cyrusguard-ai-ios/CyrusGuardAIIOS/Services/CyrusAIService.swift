import Foundation

/// Talks to the Rork toolkit language model to produce fraud verdicts.
nonisolated struct CyrusAIService: Sendable {
    static let shared = CyrusAIService()

    private var endpoint: URL? {
        let base = Config.EXPO_PUBLIC_TOOLKIT_URL.isEmpty
            ? "https://toolkit.rork.com"
            : Config.EXPO_PUBLIC_TOOLKIT_URL
        return URL(string: base + "/text/llm/")
    }

    // MARK: - Public API

    /// Analyzes a screenshot of any origin: SMS, email, WhatsApp, Facebook ad, call log, website.
    func analyzeScreenshot(imageData: Data, french: Bool) async throws -> ScanAnalysis {
        guard imageData.count > 100 else { throw CyrusError.noImage }
        let dataURL = "data:image/jpeg;base64," + imageData.base64EncodedString()
        let parts: [ToolkitPart] = [
            .text(Self.screenshotPrompt(french: french)),
            .image(dataURL),
        ]
        return try await run(parts: parts)
    }

    /// Analyzes a link, enriched with what the site actually returned.
    func analyzeLink(url: String, evidence: LinkEvidence, french: Bool) async throws -> ScanAnalysis {
        let parts: [ToolkitPart] = [
            .text(Self.linkPrompt(url: url, evidence: evidence, french: french)),
        ]
        return try await run(parts: parts)
    }

    // MARK: - Transport

    private func run(parts: [ToolkitPart]) async throws -> ScanAnalysis {
        guard let endpoint else { throw CyrusError.network }

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.timeoutInterval = 60
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let secret = Config.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY
        if !secret.isEmpty {
            request.setValue(secret, forHTTPHeaderField: "x-rork-toolkit-secret")
        }
        request.httpBody = try JSONEncoder().encode(ToolkitRequest(messages: [ToolkitMessage(role: "user", content: parts)]))

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw CyrusError.network
        }

        if let http = response as? HTTPURLResponse, http.statusCode >= 400 {
            throw CyrusError.server(http.statusCode)
        }

        guard let envelope = try? JSONDecoder().decode(ToolkitResponse.self, from: data),
              !envelope.completion.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw CyrusError.emptyResponse
        }

        guard let jsonData = Self.extractJSON(from: envelope.completion) else {
            throw CyrusError.badJSON
        }
        do {
            return try JSONDecoder().decode(ScanAnalysis.self, from: jsonData)
        } catch {
            throw CyrusError.badJSON
        }
    }

    /// Models sometimes wrap JSON in prose or code fences; pull out the object.
    private static func extractJSON(from raw: String) -> Data? {
        var text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if text.hasPrefix("```") {
            text = text.replacingOccurrences(of: "```json", with: "")
                .replacingOccurrences(of: "```", with: "")
                .trimmingCharacters(in: .whitespacesAndNewlines)
        }
        guard let start = text.firstIndex(of: "{"), let end = text.lastIndex(of: "}"), start < end else {
            return nil
        }
        return String(text[start...end]).data(using: .utf8)
    }
}

// MARK: - Wire types

private nonisolated enum ToolkitPart: Encodable, Sendable {
    case text(String)
    case image(String)

    private enum CodingKeys: String, CodingKey { case type, text, image }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .text(let value):
            try container.encode("text", forKey: .type)
            try container.encode(value, forKey: .text)
        case .image(let value):
            try container.encode("image", forKey: .type)
            try container.encode(value, forKey: .image)
        }
    }
}

private nonisolated struct ToolkitMessage: Encodable, Sendable {
    let role: String
    let content: [ToolkitPart]
}

private nonisolated struct ToolkitRequest: Encodable, Sendable {
    let messages: [ToolkitMessage]
}

private nonisolated struct ToolkitResponse: Decodable, Sendable {
    let completion: String
}

// MARK: - Prompts

extension CyrusAIService {
    private static let persona = """
    You are CyrusGuard, an expert AI analyst specialised in digital fraud, scam messages, phishing \
    and financial crime. You protect everyday people, including seniors who are not comfortable with \
    technology. You are calm, concrete and never alarmist without evidence.

    Adapt institutions and reporting bodies to the user's country when you can infer it from the \
    content (Canada: Centre antifraude du Canada, Interac, Postes Canada, Desjardins; France: \
    cybermalveillance.gouv.fr, 33700; Belgium, Switzerland, USA, UK and others accordingly). \
    If you cannot infer a country, give universally valid advice.

    Never use markdown formatting in any string you output. Write plain natural sentences. \
    Emphasise with CAPITALS instead of bold. Keep every string short enough to read on a phone.
    """

    private static let jsonContract = """
    Respond with a single valid JSON object and NOTHING else. No prose, no markdown, no code fences.

    {
      "riskScore": <integer 0-100>,
      "sourceType": "<sms|email|whatsapp|socialMessage|socialAd|marketplace|call|website|jobOffer|unknown>",
      "detectedSource": "<short French phrase naming what you recognised, e.g. 'SMS de faux avis de livraison'>",
      "detectedSourceEn": "<same in English>",
      "summary": "<one or two French sentences with the verdict>",
      "summaryEn": "<same in English>",
      "explanation": "<French paragraph explaining WHY, citing concrete details you actually saw>",
      "explanationEn": "<same in English>",
      "suspiciousElements": ["<short French item>"],
      "suspiciousElementsEn": ["<short English item>"],
      "reassuringElements": ["<short French item>"],
      "reassuringElementsEn": ["<short English item>"],
      "advice": ["<short actionable French advice>"],
      "adviceEn": ["<short actionable English advice>"]
    }

    Scoring rules:
    - 70-100 HIGH: clear scam signals such as a lookalike domain, urgency plus a payment or login link, \
      impersonation of a bank, carrier, courier or government agency, unrealistic prize or discount, \
      request for a deposit, gift card, crypto or e-transfer, or a stranger pushing an investment.
    - 40-69 MEDIUM: suspicious but not conclusive, or not enough context to be sure.
    - 0-39 LOW: consistent with a legitimate message from a real organisation.
    A fake parcel delivery notice with an unofficial domain is at least 85.
    Always include at least one piece of advice, and name the relevant reporting body when the score is 40 or more.
    """

    static func screenshotPrompt(french: Bool) -> String {
        """
        \(persona)

        The user sent you a SCREENSHOT taken on their phone. Read every piece of text visible in the \
        image: sender name, phone number or short code, domain names, links, timestamps, buttons, \
        page or account names, follower counts, prices, currency.

        Identify the source yourself from the visual layout. It can be any of these:
        - a text message thread (iMessage, Android Messages, an unknown short code)
        - an email or webmail screen: phishing, fake invoice, fake receipt, fake subscription renewal
        - a WhatsApp conversation: unknown or foreign number, wrong-number opener, crypto or investment pitch
        - a Messenger, Instagram, TikTok or Snapchat direct message: hacked friend, fake giveaway, romance scam
        - a Facebook advertisement, sponsored post, page or group post: fake store, impossible discount, \
          fake celebrity endorsement, fake contest
        - a Marketplace, Kijiji, Craigslist or classified listing: fake seller, deposit request, overpayment
        - a missed call, voicemail transcript or call log: spoofed bank or government number, tech support scam
        - a website, checkout or login page: fake bank login, fake parcel tracking, fake refund form
        - a bank or payment notification: Interac e-Transfer, PayPal, Zelle, Revolut
        - a job or work-from-home offer: fake recruiter, parcel reshipping, money mule

        State the source you recognised in detectedSource so the user can see you understood their screenshot.
        If the image contains no readable text, or nothing resembling a message, ad, call or website, \
        say so honestly with a LOW score instead of inventing a threat.

        \(jsonContract)

        The user reads \(french ? "French" : "English") first, but you must always fill BOTH language fields.
        """
    }

    static func linkPrompt(url: String, evidence: LinkEvidence, french: Bool) -> String {
        """
        \(persona)

        Analyse this link for the user: \(url)

        Here is what was actually observed by fetching it. Base your verdict on this evidence, never invent data.
        \(evidence.promptDescription)

        Judge the domain itself too: lookalike spelling of a known brand, suspicious top level domain, \
        excessive hyphens or digits, a brand name placed in a subdomain of an unrelated domain.
        Set sourceType to "website". If the site could not be reached, treat that as a meaningful \
        warning sign but stay measured.

        \(jsonContract)

        The user reads \(french ? "French" : "English") first, but you must always fill BOTH language fields.
        """
    }
}
