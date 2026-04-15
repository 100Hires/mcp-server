import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, toolResult, toolError } from "../client.js";

export function registerUserTools(server: McpServer): void {
  server.tool(
    "hires_list_users",
    "List users for the target company with role context. Returns paginated results useful for access reviews and hiring-team management.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Company ID to list users for"),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined)
          query.company_id = params.company_id;
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await apiGet("/users", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_get_user",
    "Get a single user by ID within current tenant scope. Use for identity resolution in automation flows. The `default_mail_account_id` field can be used as `from_account_id` when sending emails.",
    {
      id: z.number().describe("User ID"),
    },
    async (params) => {
      try {
        const result = await apiGet(`/users/${params.id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_list_user_mail_accounts",
    "List mail accounts connected to a user. Use to resolve `from_account_id` before creating scheduled emails via POST /candidates/{id}/messages.",
    {
      id: z.number().describe("User ID"),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await apiGet(
          `/users/${params.id}/mail-accounts`,
          query
        );
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );
}
