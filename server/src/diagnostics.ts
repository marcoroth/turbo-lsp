import { Connection, Diagnostic, DiagnosticSeverity, Position, Range } from "vscode-languageserver/node"
import { TextDocument } from "vscode-languageserver-textdocument"
import { getLanguageService, Node } from "vscode-html-languageservice"

import { DocumentService } from "./document_service"
import { attributeValue } from "./html_util"
import { TurboHTMLDataProvider } from "./data_providers/turbo_html_data_provider"

import type { Service } from "./service"
import type { Project } from "./project"

export class Diagnostics {
  private readonly connection: Connection
  private readonly turboDataProvider: TurboHTMLDataProvider
  private readonly documentService: DocumentService
  private readonly project: Project
  private readonly service: Service
  private readonly diagnosticsSource = "Turbo LSP "
  private diagnostics: Map<TextDocument, Diagnostic[]> = new Map()

  constructor(
    connection: Connection,
    turboDataProvider: TurboHTMLDataProvider,
    documentService: DocumentService,
    project: Project,
    service: Service,
  ) {
    this.connection = connection
    this.turboDataProvider = turboDataProvider
    this.documentService = documentService
    this.project = project
    this.service = service
  }

  visitNode(node: Node, textDocument: TextDocument) {
    node.children.forEach((child) => {
      this.visitNode(child, textDocument)
    })
  }

  validate(textDocument: TextDocument) {
    if (["javascript", "typescript"].includes(textDocument.languageId)) {
      this.validateJavaScriptDocument(textDocument)
    } else {
      this.validateHTMLDocument(textDocument)
    }

    this.sendDiagnosticsFor(textDocument)
  }

  validateJavaScriptDocument(_textDocument: TextDocument) {
    const sourceFile = this.project.projectFiles

    if (sourceFile) {

    }
  }

  validateHTMLDocument(textDocument: TextDocument) {
    const service = getLanguageService()
    const html = service.parseHTMLDocument(textDocument)

    html.roots.forEach((node: Node) => {
      this.visitNode(node, textDocument)
    })
  }

  refreshDocument(document: TextDocument) {
    this.validate(document)
  }

  refreshAllDocuments() {
    this.documentService.getAll().forEach((document) => {
      this.refreshDocument(document)
    })
  }

  private rangeFromNode(textDocument: TextDocument, node: Node) {
    return Range.create(textDocument.positionAt(node.start), textDocument.positionAt(node.startTagEnd || node.end))
  }

  private attributeNameRange(textDocument: TextDocument, node: Node, attribute: string, search: string) {
    const range = this.rangeFromNode(textDocument, node)
    const startTagContent = textDocument.getText(range)

    return this.rangeForAttributeName(textDocument, startTagContent, node, attribute, search)
  }

  private rangeForAttributeName(
    textDocument: TextDocument,
    tagContent: string,
    node: Node,
    attribute: string,
    search: string,
  ) {
    const searchIndex = attribute.indexOf(search) || 0
    const attributeNameStartIndex = tagContent.indexOf(attribute)

    const attributeNameStart = node.start + attributeNameStartIndex + searchIndex
    const attributeNameEnd = attributeNameStart + search.length

    return Range.create(textDocument.positionAt(attributeNameStart), textDocument.positionAt(attributeNameEnd))
  }

  private attributeValueRange(textDocument: TextDocument, node: Node, attribute: string, search: string) {
    const range = this.rangeFromNode(textDocument, node)
    const startTagContent = textDocument.getText(range)

    return this.rangeForAttributeValue(textDocument, startTagContent, node, attribute, search)
  }

  private rangeForAttributeValue(
    textDocument: TextDocument,
    tagContent: string,
    node: Node,
    attribute: string,
    search: string,
  ) {
    const value = attributeValue(node, attribute) || ""

    const searchIndex = value.indexOf(search) || 0
    const attributeStartIndex = tagContent.indexOf(attribute)

    const attributeValueStart = node.start + attributeStartIndex + attribute.length + searchIndex + 2
    const attributeValueEnd = attributeValueStart + search.length

    return Range.create(textDocument.positionAt(attributeValueStart), textDocument.positionAt(attributeValueEnd))
  }


  private pushDiagnostic(
    message: string,
    code: string,
    range: Range,
    textDocument: TextDocument,
    data = {},
    severity: DiagnosticSeverity = DiagnosticSeverity.Error,
  ) {
    const diagnostic: Diagnostic = {
      source: this.diagnosticsSource,
      severity,
      range,
      message,
      code,
      data,
    }

    const diagnostics = this.diagnostics.get(textDocument) || []
    diagnostics.push(diagnostic)

    this.diagnostics.set(textDocument, diagnostics)

    return diagnostic
  }

  private sendDiagnosticsFor(textDocument: TextDocument) {
    const diagnostics = this.diagnostics.get(textDocument) || []

    this.connection.sendDiagnostics({
      uri: textDocument.uri,
      diagnostics,
    })

    this.diagnostics.delete(textDocument)
  }

  private foundSkippableTags(value: string) {
    const skippableTags = ["<%", "<%=", "<%-", "%>", "<?=", "<?php", "?>", "{{", "}}"]
    return skippableTags.some((tag) => value.includes(tag))
  }
}
