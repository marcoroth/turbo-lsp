import { Connection, TextDocumentEdit, TextEdit, CreateFile, Range } from "vscode-languageserver/node"
import { Config } from "./config"
import { Project } from "./project"

export class Commands {
  private readonly project: Project
  private readonly connection: Connection

  constructor(project: Project, connection: Connection) {
    this.project = project
    this.connection = connection
  }

  async createTurboLSPConfig() {
    const config = await Config.fromPathOrNew(this.project.projectPath)
    const configPath = config.path
    const createFile: CreateFile = { kind: "create", uri: configPath }

    await this.connection.workspace.applyEdit({ documentChanges: [createFile] })

    const documentRange: Range = Range.create(0, 0, 0, 0)
    const textEdit: TextEdit = { range: documentRange, newText: config.toJSON() }
    const textDocumentEdit = TextDocumentEdit.create({ uri: configPath, version: 1 }, [textEdit])

    await this.connection.workspace.applyEdit({ documentChanges: [textDocumentEdit] })
    await this.connection.window.showDocument({
      uri: textDocumentEdit.textDocument.uri,
      external: false,
      takeFocus: true,
    })
  }
}
