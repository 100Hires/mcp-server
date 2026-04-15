import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, toolResult, toolError } from "../client.js";

export function registerInterviewTools(server: McpServer): void {
  server.tool(
    "hires_list_interviews",
    "List interviews with optional filters by job, application, candidate, interviewer, date, or timestamps for incremental sync. Returns paginated results.",
    {
      job_id: z
        .number()
        .optional()
        .describe("Filter interviews by job ID"),
      application_id: z
        .number()
        .optional()
        .describe("Filter interviews by application ID"),
      candidate_id: z
        .number()
        .optional()
        .describe("Filter interviews by candidate ID"),
      interviewer_user_id: z
        .number()
        .optional()
        .describe("Filter interviews by interviewer user ID"),
      date: z
        .string()
        .optional()
        .describe("Filter by interview date (YYYY-MM-DD, UTC)"),
      created_after: z
        .number()
        .optional()
        .describe(
          "Return only interviews created after this Unix timestamp (seconds)"
        ),
      updated_after: z
        .number()
        .optional()
        .describe(
          "Return only interviews updated after this Unix timestamp (seconds)"
        ),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to embed: candidate, application, job"
        ),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 20)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.job_id !== undefined) query.job_id = params.job_id;
        if (params.application_id !== undefined)
          query.application_id = params.application_id;
        if (params.candidate_id !== undefined)
          query.candidate_id = params.candidate_id;
        if (params.interviewer_user_id !== undefined)
          query.interviewer_user_id = params.interviewer_user_id;
        if (params.date !== undefined) query.date = params.date;
        if (params.created_after !== undefined)
          query.created_after = params.created_after;
        if (params.updated_after !== undefined)
          query.updated_after = params.updated_after;
        if (params.include !== undefined) query.include = params.include;
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await apiGet("/interviews", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_get_interview",
    "Get full details of a specific interview by ID. Use `include` to embed related candidate, application, or job data.",
    {
      id: z.number().describe("Interview ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to embed: candidate, application, job"
        ),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.include !== undefined) query.include = params.include;

        const result = await apiGet(`/interviews/${params.id}`, query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );
}
