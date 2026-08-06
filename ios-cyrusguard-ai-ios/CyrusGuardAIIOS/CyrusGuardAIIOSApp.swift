//
//  CyrusGuardAIIOSApp.swift
//  CyrusGuardAIIOS
//
//  Created by Rork on August 6, 2026.
//

import SwiftUI
import SwiftData

@main
struct CyrusGuardAIIOSApp: App {
    @State private var languageStore = LanguageStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(languageStore)
        }
        .modelContainer(for: ScanRecord.self)
    }
}
