import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiPost, toolResult } from "../client.js";

export function registerFeedbackTools(server: McpServer): void {
  // ── hires_submit_feedback ──────────────────────────────────────
  server.tool(
    "hires_submit_feedback",
    "Submit structured API feedback about missing features, issues, or workflow improvements. Rate limited to 5 requests per hour.",
    {
      description: z
        .string()
        .describe("Description of the issue or feedback (max 2000 chars)"),
      endpoint: z
        .string()
        .optional()
        .describe("The API endpoint this feedback relates to, e.g. /v2/candidates"),
      issue_type: z
        .enum([
          "missing_filter",
          "pagination",
          "performance",
          "missing_field",
          "bulk_operation",
          "other",
        ])
        .optional()
        .describe("Category of the issue"),
      suggested_improvement: z
        .string()
        .optional()
        .describe("Suggested solution or improvement (max 2000 chars)"),
      context: z
        .record(z.unknown())
        .optional()
        .describe("Arbitrary context object (max 4KB JSON)"),
    },
    async ({ description, endpoint, issue_type, suggested_improvement, context }) => {
      const data: Record<string, unknown> = { description };
      if (endpoint !== undefined) data.endpoint = endpoint;
      if (issue_type !== undefined) data.issue_type = issue_type;
      if (suggested_improvement !== undefined) data.suggested_improvement = suggested_improvement;
      if (context !== undefined) data.context = context;

      const text = await apiPost("/feedback", data);
      return toolResult(text);
    }
  );
}
