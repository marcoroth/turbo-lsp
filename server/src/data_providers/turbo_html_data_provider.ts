import { IHTMLDataProvider, ITagData, IAttributeData, IValueData } from "vscode-html-languageservice"

import { Project } from "../project"

export class TurboHTMLDataProvider implements IHTMLDataProvider {
  private TAGS: ITagData[] = [
    {
      name: "turbo-frame",
      description: "https://turbo.hotwired.dev/reference/frames",
      attributes: [
        { name: "action" },
        { name: "data-turbo-action" },
        { name: "id" },
        { name: "loading" },
        { name: "refresh" },
        { name: "src" },
        { name: "target" },
      ],
      references: [],
      void: false
    },
    {
      name: "turbo-stream",
      description: "https://turbo.hotwired.dev/reference/streams",
      attributes: [
        { name: "action" },
        { name: "target" },
        { name: "targets" },
        { name: "children-only" },
      ],
      references: [],
      void: false
    },
    {
      name: "turbo-cable-stream-source",
      description: "https://github.com/hotwired/turbo-rails/blob/main/app/javascript/turbo/cable_stream_source_element.js",
      attributes: [],
      references: [],
      void: false
    },
  ]

  constructor(
    private id: string,
    private project: Project,
  ) {}

  isApplicable() {
    return true
  }

  getId() {
    return this.id
  }

  provideTags(): ITagData[] {
    return this.TAGS
  }

  provideAttributes(tag: string): IAttributeData[] {
    return this.TAGS.find(turboTag => turboTag.name === tag)?.attributes || []
  }

  provideValues(tag: string, attribute: string): IValueData[] {
    if (tag === "turbo-frame") {
      if (attribute === "src") {
        return []
      }

      if (attribute === "id") {
        return []
      }

      if (attribute === "action") {
        return []
      }

      if (attribute === "loading") {
        return [{ name: "lazy"}]
      }

      if (attribute === "target") {
        return [{ name: "_top"}]
      }

      if (attribute === "data-turbo-action") {
        return [{ name: "advance"}]
      }

      if (attribute === "refresh") {
        return [{ name: "morph" }]
      }
    }

    if (tag === "turbo-stream") {
      if (attribute === "action") {
        return [
          { name: "after" },
          { name: "append" },
          { name: "before" },
          { name: "prepend" },
          { name: "remove" },
          { name: "replace" },
          { name: "update" },
        ]
      }

      if (attribute === "target") {
        return []
      }

      if (attribute === "targets") {
        return []
      }
    }

    return []
  }
}
