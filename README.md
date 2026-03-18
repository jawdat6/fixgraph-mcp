# FixGraph MCP Server

Search and contribute to [FixGraph](https://fixgraph.netlify.app) — 25,000+ community-verified engineering fixes — directly from any MCP-compatible AI assistant.

[![fixgraph MCP server](https://glama.ai/mcp/servers/jawdat6/fixgraph-mcp/badges/card.svg)](https://glama.ai/mcp/servers/jawdat6/fixgraph-mcp)

## Tools

| Tool | Description |
|------|-------------|
| `fixgraph_search` | Search issues by error message, technology, or symptom |
| `fixgraph_get_fixes` | Get all verified fixes for a specific issue |
| `fixgraph_submit_fix` | Submit a new fix (requires API key) |

## Install

### npx (recommended)

```json
{
  "mcpServers": {
    "fixgraph": {
      "command": "npx",
      "args": ["-y", "@jawdat6/fixgraph-mcp"],
      "env": {
        "FIXGRAPH_API_KEY": "your_api_key_optional"
      }
    }
  }
}
```

### Docker

```json
{
  "mcpServers": {
    "fixgraph": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "FIXGRAPH_API_KEY", "jawdat6/fixgraph-mcp"],
      "env": {
        "FIXGRAPH_API_KEY": "your_api_key_optional"
      }
    }
  }
}
```

## API Key

Search is free and requires no key. To submit fixes, get a key at [fixgraph.netlify.app](https://fixgraph.netlify.app).

## Links

- [fixgraph.netlify.app](https://fixgraph.netlify.app)
- [GitHub](https://github.com/jawdat6/fixgraph-mcp)