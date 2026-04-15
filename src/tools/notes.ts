import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete, toolResult, toolError } from "../client.js";

export function registerNoteTools(server: McpServer): void {
  // ── hires_list_notes ────────────────────────────────────────────
  server.tool(
    "hires_list_notes",
    "List notes by candidate. Returns paginated discussion notes for a candidate. Use for shared recruiter context and timeline synchronization.",
    {
      candidate_id: z
        .union([z.string(), z.number()])
        .describe("Candidate ID (numeric) or alias"),
      include: z
        .string()
        .optional()
        .describe("Include related resources, e.g. 'user' for author details"),
      page: z.number().optional().describe("Page number"),
      size: z.number().optional().describe("Page size"),
    },
    async ({ candidate_id, include, page, size }) => {
      const params: Record<string, unknown> = { candidate_id };
      if (include !== undefined) params.include = include;
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;

      const text = await apiGet("/notes", params);
      return toolResult(text);
    }
  );

  // ── hires_create_note ───────────────────────────────────────────
  server.tool(
    "hires_create_note",
    "Create a discussion note for a candidate. Supports visibility control (all or private) and @mentions with email notifications.",
    {
      candidate_id: z
        .union([z.string(), z.number()])
        .describe("Candidate ID (numeric) or alias"),
      body: z.string().describe("Note content. Supports HTML."),
      user_id: z
        .number()
        .optional()
        .describe(
          "Author user ID. If omitted, the authenticated user is used"
        ),
      visibility: z
        .string()
        .optional()
        .describe("Visibility: 'all' (default) or 'private'"),
      mention_user_ids: z
        .array(z.number())
        .optional()
        .describe(
          "Array of user IDs to mention. Mentioned users receive email notifications."
        ),
      include: z
        .string()
        .optional()
        .describe("Include related resources, e.g. 'user' for author details"),
    },
    async ({ candidate_id, body, user_id, visibility, mention_user_ids, include }) => {
      const params: Record<string, unknown> = {};
      if (include !== undefined) params.include = include;

      const data: Record<string, unknown> = { candidate_id, body };
      if (user_id !== undefined) data.user_id = user_id;
      if (visibility !== undefined) data.visibility = visibility;
      if (mention_user_ids !== undefined) data.mention_user_ids = mention_user_ids;

      const text = await apiPost("/notes", data, params);
      return toolResult(text);
    }
  );

  // ── hires_get_note ──────────────────────────────────────────────
  server.tool(
    "hires_get_note",
    "Get a single note with author and visibility metadata. Use include=user to load author details.",
    {
      id: z.number().describe("Note ID"),
      include: z
        .string()
        .optional()
        .describe("Include related resources, e.g. 'user' for author details"),
    },
    async ({ id, include }) => {
      const params: Record<string, unknown> = {};
      if (include !== undefined) params.include = include;

      const text = await apiGet(`/notes/${id}`, params);
      return toolResult(text);
    }
  );

  // ── hires_update_note ───────────────────────────────────────────
  server.tool(
    "hires_update_note",
    "Update note body and/or visibility without creating a new timeline item. Use for corrections and moderation workflows.",
    {
      id: z.number().describe("Note ID"),
      body: z.string().optional().describe("Note content. Supports HTML."),
      visibility: z
        .string()
        .optional()
        .describe("Visibility: 'all' (default) or 'private'"),
      include: z
        .string()
        .optional()
        .describe("Include related resources, e.g. 'user' for author details"),
    },
    async ({ id, body, visibility, include }) => {
      const params: Record<string, unknown> = {};
      if (include !== undefined) params.include = include;

      const data: Record<string, unknown> = {};
      if (body !== undefined) data.body = body;
      if (visibility !== undefined) data.visibility = visibility;

      const text = await apiPut(`/notes/${id}`, data, params);
      return toolResult(text);
    }
  );

  // ── hires_delete_note ───────────────────────────────────────────
  server.tool(
    "hires_delete_note",
    "Delete a note. Use for moderation policies and data cleanup operations.",
    {
      id: z.number().describe("Note ID"),
    },
    async ({ id }) => {
      const text = await apiDelete(`/notes/${id}`);
      return toolResult(text);
    }
  );
}
