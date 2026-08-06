import SwiftUI

struct ContentView: View {
    @Environment(LanguageStore.self) private var lang

    var body: some View {
        NavigationStack {
            HomeView()
                .navigationDestination(for: HomeRoute.self) { route in
                    switch route {
                    case .screenshot: ScreenshotAnalysisView()
                    case .link: LinkAnalysisView()
                    case .shield: ShieldView()
                    case .history: HistoryView()
                    }
                }
                .navigationDestination(for: ScanRecord.self) { record in
                    ResultDetailView(record: record)
                }
        }
        .tint(GuardTheme.accent)
        .preferredColorScheme(.dark)
    }
}

#Preview {
    ContentView()
        .environment(LanguageStore())
}
