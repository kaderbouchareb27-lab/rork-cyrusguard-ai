import Foundation

/// Facts gathered by actually fetching a link, handed to the model as evidence.
nonisolated struct LinkEvidence: Sendable {
    var normalizedURL: String = ""
    var host: String = ""
    var reachable: Bool = false
    var statusCode: Int?
    var usesHTTPS: Bool = false
    var redirectedTo: String?
    var pageTitle: String?
    var hasLegalPage: Bool = false
    var hasPrivacyPage: Bool = false
    var hasContactInfo: Bool = false
    var mentionsPayment: Bool = false
    var suspiciousTLD: Bool = false
    var lookalikeBrand: String?
    var failureReason: String?

    /// Human readable evidence block injected into the prompt.
    var promptDescription: String {
        var lines: [String] = []
        lines.append("- Normalised URL: \(normalizedURL)")
        lines.append("- Host: \(host)")
        lines.append("- Uses HTTPS: \(usesHTTPS ? "yes" : "no")")
        if reachable {
            lines.append("- Reachable: yes, HTTP status \(statusCode.map(String.init) ?? "unknown")")
            if let redirectedTo { lines.append("- Redirected to: \(redirectedTo)") }
            if let pageTitle, !pageTitle.isEmpty { lines.append("- Page title: \(pageTitle)") }
            lines.append("- Legal or terms page linked: \(hasLegalPage ? "yes" : "no")")
            lines.append("- Privacy policy linked: \(hasPrivacyPage ? "yes" : "no")")
            lines.append("- Contact details present: \(hasContactInfo ? "yes" : "no")")
            lines.append("- Asks for payment or card details: \(mentionsPayment ? "yes" : "no")")
        } else {
            lines.append("- Reachable: NO. \(failureReason ?? "The server did not respond.")")
        }
        lines.append("- Suspicious top level domain: \(suspiciousTLD ? "yes" : "no")")
        if let lookalikeBrand {
            lines.append("- Host resembles the brand \"\(lookalikeBrand)\" without being its official domain")
        }
        return lines.joined(separator: "\n")
    }
}

/// Fetches a URL and extracts objective signals. No third party service involved.
nonisolated struct LinkInspector: Sendable {
    static let shared = LinkInspector()

    private static let suspiciousTLDs: Set<String> = [
        "xyz", "top", "click", "buzz", "tk", "ml", "ga", "cf", "gq", "pw", "cc",
        "icu", "rest", "monster", "quest", "sbs", "cyou", "lol", "bond",
    ]

    /// Brands whose names are frequently spoofed, with their legitimate domains.
    private static let watchedBrands: [String: [String]] = [
        "desjardins": ["desjardins.com"],
        "interac": ["interac.ca"],
        "postescanada": ["postescanada-canadapost.ca", "canadapost.ca"],
        "canadapost": ["canadapost.ca", "postescanada-canadapost.ca"],
        "purolator": ["purolator.com"],
        "revenuquebec": ["revenuquebec.ca"],
        "rbc": ["rbc.com", "rbcroyalbank.com"],
        "bmo": ["bmo.com"],
        "scotiabank": ["scotiabank.com"],
        "tdcanadatrust": ["td.com", "tdcanadatrust.com"],
        "amazon": ["amazon.com", "amazon.ca", "amazon.fr"],
        "apple": ["apple.com", "icloud.com"],
        "paypal": ["paypal.com"],
        "netflix": ["netflix.com"],
        "microsoft": ["microsoft.com", "live.com", "outlook.com"],
        "laposte": ["laposte.fr"],
        "ameli": ["ameli.fr"],
        "impots": ["impots.gouv.fr"],
        "chronopost": ["chronopost.fr"],
        "colissimo": ["laposte.fr"],
        "creditagricole": ["credit-agricole.fr"],
        "bnpparibas": ["mabanque.bnpparibas"],
        "dhl": ["dhl.com"],
        "fedex": ["fedex.com"],
        "ups": ["ups.com"],
        "usps": ["usps.com"],
    ]

    func inspect(rawInput: String) async -> LinkEvidence {
        var evidence = LinkEvidence()
        let trimmed = rawInput.trimmingCharacters(in: .whitespacesAndNewlines)
        let withScheme = trimmed.lowercased().hasPrefix("http") ? trimmed : "https://" + trimmed
        evidence.normalizedURL = withScheme

        guard let url = URL(string: withScheme), let host = url.host()?.lowercased() else {
            evidence.failureReason = "The address is not a valid URL."
            return evidence
        }
        evidence.host = host
        evidence.usesHTTPS = url.scheme?.lowercased() == "https"

        let bareHost = host.hasPrefix("www.") ? String(host.dropFirst(4)) : host
        if let tld = bareHost.split(separator: ".").last {
            evidence.suspiciousTLD = Self.suspiciousTLDs.contains(String(tld))
        }
        evidence.lookalikeBrand = Self.detectLookalike(host: bareHost)

        var request = URLRequest(url: url)
        request.timeoutInterval = 12
        request.setValue(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CyrusGuard/1.0",
            forHTTPHeaderField: "User-Agent"
        )

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            evidence.reachable = true
            if let http = response as? HTTPURLResponse {
                evidence.statusCode = http.statusCode
            }
            if let finalURL = response.url?.absoluteString, finalURL != withScheme {
                evidence.redirectedTo = finalURL
            }
            let html = String(decoding: data.prefix(220_000), as: UTF8.self).lowercased()
            evidence.pageTitle = Self.extractTitle(from: html)
            evidence.hasLegalPage = Self.containsAny(html, [
                "mentions légales", "mentions legales", "terms of service", "terms and conditions",
                "conditions générales", "conditions generales", "cgv", "legal notice",
            ])
            evidence.hasPrivacyPage = Self.containsAny(html, [
                "politique de confidentialité", "politique de confidentialite",
                "privacy policy", "vie privée", "vie privee",
            ])
            evidence.hasContactInfo = Self.containsAny(html, [
                "contact", "nous joindre", "customer service", "service client", "mailto:",
            ])
            evidence.mentionsPayment = Self.containsAny(html, [
                "card number", "numéro de carte", "numero de carte", "cvv", "cvc",
                "checkout", "paiement", "payment", "billing", "facturation",
            ])
        } catch {
            evidence.reachable = false
            let nsError = error as NSError
            evidence.failureReason = nsError.code == NSURLErrorTimedOut
                ? "The server did not answer within 12 seconds."
                : "The connection failed (\(nsError.localizedDescription))."
        }

        return evidence
    }

    private static func detectLookalike(host: String) -> String? {
        let stripped = host.replacingOccurrences(of: "-", with: "")
            .replacingOccurrences(of: "_", with: "")
        for (brand, legitimateDomains) in watchedBrands {
            guard stripped.contains(brand) else { continue }
            let isLegitimate = legitimateDomains.contains { host == $0 || host.hasSuffix("." + $0) }
            if !isLegitimate {
                return brand
            }
        }
        return nil
    }

    private static func extractTitle(from html: String) -> String? {
        guard let open = html.range(of: "<title"),
              let gt = html.range(of: ">", range: open.upperBound..<html.endIndex),
              let close = html.range(of: "</title>", range: gt.upperBound..<html.endIndex) else {
            return nil
        }
        let title = html[gt.upperBound..<close.lowerBound]
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return title.isEmpty ? nil : String(title.prefix(160))
    }

    private static func containsAny(_ haystack: String, _ needles: [String]) -> Bool {
        needles.contains { haystack.contains($0) }
    }
}
