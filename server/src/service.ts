import { Connection, InitializeParams } from "vscode-languageserver/node"
import { getLanguageService, LanguageService } from "vscode-html-languageservice"

import { TurboHTMLDataProvider } from "./data_providers/turbo_html_data_provider"
import { Settings } from "./settings"
import { DocumentService } from "./document_service"
import { Diagnostics } from "./diagnostics"
import { Commands } from "./commands"
import { CodeActions } from "./code_actions"
import { Config } from "./config"

import { Project } from "./project"

export class Service {
  connection: Connection
  settings: Settings
  htmlLanguageService: LanguageService
  turboDataProvider: TurboHTMLDataProvider
  diagnostics: Diagnostics
  commands: Commands
  documentService: DocumentService
  codeActions: CodeActions
  project: Project
  config?: Config

  constructor(connection: Connection, params: InitializeParams) {
    this.connection = connection
    this.settings = new Settings(params, this.connection)
    this.documentService = new DocumentService(this.connection)
    this.project = new Project(this.settings.projectPath.replace("file://", ""))
    this.codeActions = new CodeActions(this.documentService, this.project)
    this.turboDataProvider = new TurboHTMLDataProvider("id", this.project)
    this.diagnostics = new Diagnostics(this.connection, this.turboDataProvider, this.documentService, this.project, this)
    this.commands = new Commands(this.project, this.connection)

    this.htmlLanguageService = getLanguageService({
      customDataProviders: [this.turboDataProvider],
    })
  }

  async init() {
    await this.project.initialize()

    this.config = await Config.fromPathOrNew(this.project.projectPath)

    // Only keep settings for open documents
    this.documentService.onDidClose((change) => {
      this.settings.documentSettings.delete(change.document.uri)
    })

    // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.
    this.documentService.onDidChangeContent((change) => {
      this.diagnostics.refreshDocument(change.document)
    })
  }

  async refresh() {
    await this.project.refresh()

    this.diagnostics.refreshAllDocuments()
  }

  async refreshConfig() {
    this.config = await Config.fromPathOrNew(this.project.projectPath)
  }
}
