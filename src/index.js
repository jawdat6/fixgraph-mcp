#!/usr/bin/env node
'use strict';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const BASE_URL = 'https://fixgraph.netlify.app/api';
const API_KEY  = process.env.FIXGRAPH_API_KEY || '';

const headers = (extra = {}) => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'fixgraph-mcp/0.1.0',
  ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
  ...extra,
});

// ── Tool implementations ──────────────────────────────────────────────────────

async function searchIssues({ query, limit = 5, category }) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (category) params.set('category', category);

  const res  = await fetch(`${BASE_URL}/issues/search?${params}`, { headers: headers() });
  const data = await res.json();
  const issues = data.items ?? data.results ?? data.issues ?? data.data ?? [];

  if (!issues.length) return { content: [{ type: 'text', text: 'No results found.' }] };

  const text = issues.map((issue, i) => {
    const score = issue.trust_score ?? issue.trustScore;
    const fixes = issue.fix_count  ?? issue.fixCount ?? '?';
    return [
      `${i + 1}. ${issue.title}`,
      `   ID: ${issue.id ?? issue.slug}`,
      score != null ? `   Trust: ${score}%` : '',
      `   Fixes: ${fixes}`,
      issue.tags?.length ? `   Tags: ${issue.tags.join(', ')}` : '',
      `   URL: https://fixgraph.netlify.app/issues/${issue.slug ?? issue.id}`,
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  return { content: [{ type: 'text', text }] };
}

async function getIssueFixes({ issue_id }) {
  const res  = await fetch(`${BASE_URL}/fixes?issueId=${encodeURIComponent(issue_id)}`, { headers: headers() });
  const data = await res.json();
  const fixes = data.items ?? data.results ?? data.data ?? [];

  if (!fixes.length) return { content: [{ type: 'text', text: 'No fixes found for this issue.' }] };

  const text = fixes.map((fix, i) => {
    const steps = (fix.steps ?? [])
      .map(s => `     ${s.order ?? i + 1}. ${s.title ? s.title + ': ' : ''}${s.description ?? ''}`)
      .join('\n');
    return [
      `Fix ${i + 1}: ${fix.title ?? fix.summary ?? ''}`,
      fix.root_cause ? `Root cause: ${fix.root_cause}` : '',
      steps ? `Steps:\n${steps}` : '',
      fix.validation ? `Validation: ${fix.validation}` : '',
    ].filter(Boolean).join('\n');
  }).join('\n\n---\n\n');

  return { content: [{ type: 'text', text }] };
}

async function submitFix({ issue_id, title, root_cause, steps, validation, risk_level = 'low' }) {
  if (!API_KEY) {
    return { content: [{ type: 'text', text: 'FIXGRAPH_API_KEY is required to submit fixes.' }], isError: true };
  }

  const res = await fetch(`${BASE_URL}/fixes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ issue_id, title, root_cause, steps, validation, risk_level, source: 'mcp' }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { content: [{ type: 'text', text: `Failed to submit fix (${res.status}): ${err}` }], isError: true };
  }

  const data = await res.json();
  return { content: [{ type: 'text', text: `Fix submitted successfully. ID: ${data.id ?? data.fix_id ?? 'ok'}` }] };
}

// ── Server setup ──────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'fixgraph', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'fixgraph_search',
      description: 'Search FixGraph for engineering fixes. Returns matching issues with trust scores and fix counts.',
      inputSchema: {
        type: 'object',
        properties: {
          query:    { type: 'string',  description: 'Error message, technology, or symptom to search for' },
          limit:    { type: 'integer', description: 'Number of results (1–20, default 5)', minimum: 1, maximum: 20 },
          category: { type: 'string',  description: 'Optional category filter (e.g. "databases", "networking")' },
        },
        required: ['query'],
      },
    },
    {
      name: 'fixgraph_get_fixes',
      description: 'Get all verified fixes for a specific FixGraph issue by its ID or slug.',
      inputSchema: {
        type: 'object',
        properties: {
          issue_id: { type: 'string', description: 'Issue ID or slug from a fixgraph_search result' },
        },
        required: ['issue_id'],
      },
    },
    {
      name: 'fixgraph_submit_fix',
      description: 'Submit a new fix to FixGraph. Requires FIXGRAPH_API_KEY env var.',
      inputSchema: {
        type: 'object',
        properties: {
          issue_id:   { type: 'string', description: 'Issue ID to attach the fix to' },
          title:      { type: 'string', description: 'Short title for the fix' },
          root_cause: { type: 'string', description: 'Why the issue occurs' },
          steps: {
            type: 'array',
            description: 'Ordered fix steps',
            items: {
              type: 'object',
              properties: {
                order:       { type: 'integer' },
                title:       { type: 'string' },
                description: { type: 'string' },
                code:        { type: 'string' },
                codeLanguage:{ type: 'string' },
              },
              required: ['order', 'description'],
            },
          },
          validation: { type: 'string', description: 'How to verify the fix worked' },
          risk_level: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Risk level of applying the fix' },
        },
        required: ['issue_id', 'title', 'root_cause', 'steps'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'fixgraph_search':     return await searchIssues(args);
      case 'fixgraph_get_fixes':  return await getIssueFixes(args);
      case 'fixgraph_submit_fix': return await submitFix(args);
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
