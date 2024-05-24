# Turbo LSP

Intelligent Turbo tooling for Visual Studio Code

![](/assets/turbo-lsp.png)

## Functionality

> [!IMPORTANT]
> This Language Server Protocol (LSP) implementation is currently in a preliminary stage of development and does not yet include support for Ruby-related functionalities.

### Completions

* Completions for Turbo HTML Custom Elements

    ![CleanShot 2024-05-24 at 13 32 11](https://github.com/marcoroth/turbo-lsp/assets/6411752/762a2b53-72a1-4e82-ad9c-41f39a9afb50)


* Completions for Turbo HTML Custom Element Attributes

    ![CleanShot 2024-05-24 at 13 32 30](https://github.com/marcoroth/turbo-lsp/assets/6411752/adee6233-6f5a-4fe6-aaf2-48381ed3ae16)


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
