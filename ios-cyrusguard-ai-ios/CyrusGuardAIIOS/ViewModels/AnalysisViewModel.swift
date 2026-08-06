import Foundation
import SwiftUI
import SwiftData
import PhotosUI
import UIKit

/// Drives both analysis flows: screenshot inspection and link inspection.
@Observable
final class AnalysisViewModel {
    enum Phase: Equatable {
        case idle
        case reading
        case analyzing
        case done
        case failed(String)
    }

    var phase: Phase = .idle
    var progress: Double = 0
    var latestRecord: ScanRecord?

    private var progressTask: Task<Void, Never>?

    var isBusy: Bool {
        phase == .reading || phase == .analyzing
    }

    var errorMessage: String? {
        if case .failed(let message) = phase { return message }
        return nil
    }

    func reset() {
        progressTask?.cancel()
        progressTask = nil
        phase = .idle
        progress = 0
        latestRecord = nil
    }

    // MARK: - Screenshot flow

    func analyze(item: PhotosPickerItem, context: ModelContext, french: Bool) async {
        phase = .reading
        startProgress()

        guard let raw = try? await item.loadTransferable(type: Data.self),
              let prepared = Self.prepareForUpload(raw) else {
            finish(withError: CyrusError.noImage.message(french: french))
            return
        }

        phase = .analyzing
        do {
            let analysis = try await CyrusAIService.shared.analyzeScreenshot(
                imageData: prepared.upload,
                french: french
            )
            let record = ScanRecord(analysis: analysis, thumbnailData: prepared.thumbnail)
            context.insert(record)
            try? context.save()
            complete(with: record)
        } catch let error as CyrusError {
            finish(withError: error.message(french: french))
        } catch {
            finish(withError: CyrusError.network.message(french: french))
        }
    }

    // MARK: - Link flow

    func analyze(link: String, context: ModelContext, french: Bool) async {
        let trimmed = link.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 4, trimmed.contains(".") else {
            phase = .failed(french
                ? "Entrez une adresse valide, par exemple boutique-exemple.com"
                : "Enter a valid address, for example example-shop.com")
            return
        }

        phase = .reading
        startProgress()

        let evidence = await LinkInspector.shared.inspect(rawInput: trimmed)
        phase = .analyzing

        do {
            let analysis = try await CyrusAIService.shared.analyzeLink(
                url: evidence.normalizedURL,
                evidence: evidence,
                french: french
            )
            let record = ScanRecord(analysis: analysis, inspectedURL: evidence.normalizedURL)
            context.insert(record)
            try? context.save()
            complete(with: record)
        } catch let error as CyrusError {
            finish(withError: error.message(french: french))
        } catch {
            finish(withError: CyrusError.network.message(french: french))
        }
    }

    // MARK: - Progress choreography

    private func startProgress() {
        progress = 0
        progressTask?.cancel()
        progressTask = Task { [weak self] in
            // Creeps toward 90% so the bar always feels alive while the model thinks.
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(220))
                guard let self, self.isBusy else { return }
                await MainActor.run {
                    if self.progress < 0.9 {
                        self.progress += Double.random(in: 0.015...0.05)
                    }
                }
            }
        }
    }

    private func complete(with record: ScanRecord) {
        progressTask?.cancel()
        progressTask = nil
        withAnimation(.easeOut(duration: 0.25)) { progress = 1 }
        latestRecord = record
        phase = .done
    }

    private func finish(withError message: String) {
        progressTask?.cancel()
        progressTask = nil
        progress = 0
        phase = .failed(message)
    }

    // MARK: - Image preparation

    /// Downsizes and compresses a screenshot so the upload stays small but readable.
    private static func prepareForUpload(_ data: Data) -> (upload: Data, thumbnail: Data)? {
        guard let image = UIImage(data: data) else { return nil }

        let uploadImage = resize(image, maxDimension: 1400)
        guard let upload = uploadImage.jpegData(compressionQuality: 0.55), upload.count > 100 else {
            return nil
        }
        let thumbnailImage = resize(image, maxDimension: 320)
        let thumbnail = thumbnailImage.jpegData(compressionQuality: 0.5) ?? upload
        return (upload, thumbnail)
    }

    private static func resize(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
        let longest = max(image.size.width, image.size.height)
        guard longest > maxDimension else { return image }
        let scale = maxDimension / longest
        let target = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        let renderer = UIGraphicsImageRenderer(size: target)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: target))
        }
    }
}
