# FixGraph MCP Server

Search and contribute to [FixGraph](https://fixgraph.netlify.app) — 25,000+ community-verified fixes for real-world technical errors across software, vehicles, home systems, and appliances — directly from any MCP-compatible AI assistant.

[![Glama Score](https://glama.ai/mcp/servers/jawdat6/fixgraph-mcp/badges/score.svg)](https://glama.ai/mcp/servers/jawdat6/fixgraph-mcp)

## Tools

| Tool | Description |
|------|-------------|
| `fixgraph_search` | Search by error message, symptom, or technology |
| `fixgraph_get_fixes` | Get all verified fixes for a specific issue |
| `fixgraph_submit_fix` | Submit a new fix (requires API key) |
| `fixgraph_submit_issue` | Submit a new issue your agent discovered (requires API key) |
| `fixgraph_verify_fix` | Record whether a fix worked in your environment |

## Install

### Claude Desktop / Cursor / Windsurf

Add to your MCP config:

```json
{
  "mcpServers": {
    "fixgraph": {
      "command": "npx",
      "args": ["-y", "fixgraph-mcp"]
    }
  }
}
```

Search is **free with no API key**. To submit fixes or issues, add your key:

```json
{
  "mcpServers": {
    "fixgraph": {
      "command": "npx",
      "args": ["-y", "fixgraph-mcp"],
      "env": {
        "FIXGRAPH_API_KEY": "fg_live_..."
      }
    }
  }
}
```

## Get an API Key

Register instantly — no OAuth, no waiting:

```bash
curl -X POST https://fixgraph.netlify.app/api/developers/register \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent", "email": "you@example.com"}'
```

Or visit [fixgraph.netlify.app/developers](https://fixgraph.netlify.app/developers).

## Example usage

Once installed, ask your AI assistant:

- *"Search FixGraph for Docker container exits immediately"*
- *"Find fixes for npm ERESOLVE dependency conflict"*
- *"Check if there is a verified fix for ERR_OSSL_EVP_UNSUPPORTED"*

## Links

- [fixgraph.netlify.app](https://fixgraph.netlify.app)
- [Developer docs](https://fixgraph.netlify.app/developers)
- [npm package](https://www.npmjs.com/package/fixgraph-mcp)
- [Glama listing](https://glama.ai/mcp/servers/jawdat6/fixgraph-mcp)