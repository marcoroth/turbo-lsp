# Turbo LSP

Intelligent Turbo tooling for Visual Studio Code

![](/assets/turbo-lsp.png)

## Functionality

Currently, this Language Server only works for HTML, though its utility extends to various file types such as ERB, PHP, or Blade files.

### Completions

* Completions for Turbo HTML Custom Elements
* Completions for Turbo HTML Custom Element Attributes

## Structure

```
.
├── package.json // The extension manifest.
|
├── client // Language Client
│   └── src
│      └── extension.ts // Language Client entry point
|
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Running the extension locally

- Run `yarn install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a HTML file.
