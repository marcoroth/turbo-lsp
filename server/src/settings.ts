import { ClientCapabilities, Connection, InitializeParams } from "vscode-languageserver/node"

export interface TurboSettings {}

export class Settings {
  // The global settings, used when the `workspace/configuration` request is not supported by the client.
  // Please note that this is not the case when using this server with the client provided in this example
  // but could happen with other clients.
  defaultSettings: TurboSettings = {}
  globalSettings: TurboSettings = this.defaultSettings
  documentSettings: Map<string, Thenable<TurboSettings>> = new Map()

  hasConfigurationCapability = false
  hasWorkspaceFolderCapability = false
  hasDiagnosticRelatedInformationCapability = false

  params: InitializeParams
  capabilities: ClientCapabilities
  connection: Connection

  constructor(params: InitializeParams, connection: Connection) {
    this.params = params
    this.capabilities = params.capabilities
    this.connection = connection

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    this.hasConfigurationCapability = !!(this.capabilities.workspace && !!this.capabilities.workspace.configuration)

    this.hasWorkspaceFolderCapability = !!(
      this.capabilities.workspace && !!this.capabilities.workspace.workspaceFolders
    )

    this.hasDiagnosticRelatedInformationCapability = !!(
      this.capabilities.textDocument &&
      this.capabilities.textDocument.publishDiagnostics &&
      this.capabilities.textDocument.publishDiagnostics.relatedInformation
    )
  }

  get projectPath() {
    return this.params.rootUri || ""
  }

  getDocumentSettings(resource: string): Thenable<TurboSettings> {
    if (!this.hasConfigurationCapability) {
      return Promise.resolve(this.globalSettings)
    }

    let result = this.documentSettings.get(resource)

    if (!result) {
      result = this.connection.workspace.getConfiguration({
        scopeUri: resource,
        section: "languageServerTurbo",
      })
      this.documentSettings.set(resource, result)
    }

    return result
  }
}
