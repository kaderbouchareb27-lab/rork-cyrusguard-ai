import Foundation
import SwiftData

/// A saved analysis, kept locally on device only.
@Model
final class ScanRecord {
    var id: UUID = UUID()
    var createdAt: Date = Date()
    var riskScore: Int = 0
    var sourceRaw: String = ScanSource.unknown.rawValue
    var detectedSource: String = ""
    var detectedSourceEn: String = ""
    var summary: String = ""
    var summaryEn: String = ""
    var explanation: String = ""
    var explanationEn: String = ""
    var suspiciousElements: [String] = []
    var suspiciousElementsEn: [String] = []
    var reassuringElements: [String] = []
    var reassuringElementsEn: [String] = []
    var advice: [String] = []
    var adviceEn: [String] = []
    /// Set when the analysis came from a link check rather than a screenshot.
    var inspectedURL: String?
    var thumbnailData: Data?

    init(analysis: ScanAnalysis, inspectedURL: String? = nil, thumbnailData: Data? = nil) {
        self.id = UUID()
        self.createdAt = Date()
        self.riskScore = analysis.riskScore
        self.sourceRaw = analysis.sourceType.rawValue
        self.detectedSource = analysis.detectedSource
        self.detectedSourceEn = analysis.detectedSourceEn
        self.summary = analysis.summary
        self.summaryEn = analysis.summaryEn
        self.explanation = analysis.explanation
        self.explanationEn = analysis.explanationEn
        self.suspiciousElements = analysis.suspiciousElements
        self.suspiciousElementsEn = analysis.suspiciousElementsEn
        self.reassuringElements = analysis.reassuringElements
        self.reassuringElementsEn = analysis.reassuringElementsEn
        self.advice = analysis.advice
        self.adviceEn = analysis.adviceEn
        self.inspectedURL = inspectedURL
        self.thumbnailData = thumbnailData
    }

    var source: ScanSource { ScanSource(rawValue: sourceRaw) ?? .unknown }
    var riskLevel: RiskLevel { RiskLevel(score: riskScore) }

    func summaryText(french: Bool) -> String {
        let value = french ? summary : summaryEn
        return value.isEmpty ? summary : value
    }

    func explanationText(french: Bool) -> String {
        let value = french ? explanation : explanationEn
        return value.isEmpty ? explanation : value
    }

    func detectedSourceText(french: Bool) -> String {
        let value = french ? detectedSource : detectedSourceEn
        return value.isEmpty ? source.label(french: french) : value
    }

    func suspicious(french: Bool) -> [String] {
        let value = french ? suspiciousElements : suspiciousElementsEn
        return value.isEmpty ? suspiciousElements : value
    }

    func reassuring(french: Bool) -> [String] {
        let value = french ? reassuringElements : reassuringElementsEn
        return value.isEmpty ? reassuringElements : value
    }

    func adviceList(french: Bool) -> [String] {
        let value = french ? advice : adviceEn
        return value.isEmpty ? advice : value
    }
}
