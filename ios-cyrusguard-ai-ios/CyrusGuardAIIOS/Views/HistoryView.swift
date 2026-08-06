import SwiftUI
import SwiftData

/// Every past verdict, newest first, stored only on this device.
struct HistoryView: View {
    @Environment(LanguageStore.self) private var lang
    @Environment(\.modelContext) private var context
    @Query(sort: \ScanRecord.createdAt, order: .reverse) private var records: [ScanRecord]

    var body: some View {
        ZStack {
            GuardBackdrop()

            if records.isEmpty {
                emptyState
            } else {
                List {
                    ForEach(records) { record in
                        NavigationLink(value: record) {
                            HistoryRow(record: record)
                        }
                        .listRowBackground(
                            GuardTheme.surface.opacity(0.6)
                                .clipShape(.rect(cornerRadius: 16))
                                .padding(.vertical, 4)
                        )
                        .listRowSeparator(.hidden)
                    }
                    .onDelete(perform: delete)
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
        }
        .navigationTitle(lang.tr("Historique", "History"))
        .navigationDestination(for: ScanRecord.self) { record in
            ResultDetailView(record: record)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 14) {
            Image(systemName: "clock.badge.checkmark")
                .font(.system(size: 42, weight: .light))
                .foregroundStyle(GuardTheme.accent.opacity(0.7))
            Text(lang.tr("Aucune analyse encore", "No analysis yet"))
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundStyle(GuardTheme.textPrimary)
            Text(lang.tr(
                "Vos rapports apparaîtront ici, uniquement sur cet iPhone.",
                "Your reports will appear here, on this iPhone only."
            ))
            .font(.system(size: 14))
            .multilineTextAlignment(.center)
            .foregroundStyle(GuardTheme.textMuted)
            .padding(.horizontal, 40)
        }
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets {
            context.delete(records[index])
        }
        try? context.save()
    }
}

private struct HistoryRow: View {
    let record: ScanRecord
    @Environment(LanguageStore.self) private var lang

    var body: some View {
        HStack(spacing: 13) {
            ZStack {
                Circle()
                    .fill(record.riskLevel.tint.opacity(0.15))
                Text("\(record.riskScore)")
                    .font(.system(size: 15, weight: .bold, design: .rounded))
                    .foregroundStyle(record.riskLevel.tint)
            }
            .frame(width: 46, height: 46)

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 5) {
                    Image(systemName: record.source.symbol)
                        .font(.system(size: 10, weight: .semibold))
                    Text(record.detectedSourceText(french: lang.isFrench))
                        .font(.system(size: 11.5, weight: .semibold))
                        .lineLimit(1)
                }
                .foregroundStyle(GuardTheme.accentLight)

                Text(record.summaryText(french: lang.isFrench))
                    .font(.system(size: 13))
                    .foregroundStyle(GuardTheme.textPrimary.opacity(0.9))
                    .lineLimit(2)

                Text(record.createdAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.system(size: 10.5))
                    .foregroundStyle(GuardTheme.textMuted)
            }
        }
        .padding(.vertical, 6)
    }
}
