# Turbo Language Server

[Language Server Protocol](https://github.com/Microsoft/language-server-protocol) implementation for [Turbo](https://turbo.hotwired.dev), used by [Turbo LSP for VS Code](https://marketplace.visualstudio.com/items?itemName=marcoroth.turbo-lsp).

## Install

```bash
npm install -g turbo-language-server
```

```bash
yarn global add turbo-language-server
```

## Run

```bash
turbo-language-server --stdio
```

```
Usage: turbo-language-server [options]

Options:

  --stdio          use stdio
  --node-ipc       use node-ipc
  --socket=<port>  use socket
```
