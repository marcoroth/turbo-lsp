import {
  createConnection,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  DidChangeWatchedFilesNotification,
  TextDocumentSyncKind,
  InitializeResult,
  Diagnostic,
} from "vscode-languageserver/node"

import { Service } from "./service"
import { TurboSettings } from "./settings"

let service: Service
const connection = createConnection(ProposedFeatures.all)

connection.onInitialize(async (params: InitializeParams) => {
  service = new Service(connection, params)
  await service.init()

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { resolveProvider: true },
      codeActionProvider: true,
      definitionProvider: true,
      executeCommandProvider: {
        commands: [
          "turbo.config.create"
        ],
      },
    },
  }

  if (service.settings.hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    }
  }

  return result
})

connection.onInitialized(() => {
  if (service.settings.hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined)
  }

  if (service.settings.hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.")
    })
  }

  connection.client.register(DidChangeWatchedFilesNotification.type, {
    watchers: [
      { globPattern: `**/**/*.{ts,js}` },
      { globPattern: `**/**/.turbo-lsp/config.json` },
    ],
  })
})

connection.onDidChangeConfiguration((change) => {
  if (service.settings.hasConfigurationCapability) {
    // Reset all cached document settings
    service.settings.documentSettings.clear()
  } else {
    service.settings.globalSettings = <TurboSettings>(
      (change.settings.languageServerTurbo || service.settings.defaultSettings)
    )
  }

  service.refresh()
})

connection.onDidOpenTextDocument((params) => {
  const document = service.documentService.get(params.textDocument.uri)

  if (document) {
    service.diagnostics.refreshDocument(document)
  }
})


connection.onDidChangeWatchedFiles((params) => {
  params.changes.forEach(async (event) => {
    if (event.uri.endsWith("/.turbo-lsp/config.json")) {
      await service.refreshConfig()

      service.documentService.getAll().forEach((document) => {
        service.diagnostics.refreshDocument(document)
      })
    }
  })
})

connection.onCodeAction((params) => service.codeActions.onCodeAction(params))

connection.onExecuteCommand((params) => {
  if (!params.arguments) return

  if (params.command === "stimulus.config.create") {
    const [_identifier, _diagnostic] = params.arguments as [string, Diagnostic]

    service.commands.createTurboLSPConfig()
  }
})

connection.onCompletion((textDocumentPosition) => {
  const document = service.documentService.get(textDocumentPosition.textDocument.uri)

  if (!document) return null

  return service.htmlLanguageService.doComplete(
    document,
    textDocumentPosition.position,
    service.htmlLanguageService.parseHTMLDocument(document),
  )
})

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item) => {
  if (item.data?.detail) item.detail = item.data.detail
  if (item.data?.documentation) item.documentation = item.data.documentation
  if (item.data?.kind) item.kind = item.data.kind

  return item
})

// Listen on the connection
connection.listen()
