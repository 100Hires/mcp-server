import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, toolResult, toolError } from "../client.js";

export function registerCompanyTools(server: McpServer): void {
  // --- List companies ---
  server.tool(
    "hires_list_companies",
    "List partner-accessible companies with pagination. Use for tenant discovery and management panels.",
    {
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await apiGet("/companies", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- Create company ---
  server.tool(
    "hires_create_company",
    "Create a client company and link ownership context. Typical entrypoint for multi-tenant onboarding.",
    {
      name: z.string().describe("Company name"),
      company_owner_email: z
        .string()
        .describe("Company owner email address"),
      company_owner_name: z.string().describe("Company owner full name"),
      website: z.string().optional().describe("Company website URL"),
      url: z.string().optional().describe("Company profile URL"),
      company_owner_phone: z
        .string()
        .optional()
        .describe("Company owner phone number"),
      is_staffing_agency: z
        .boolean()
        .optional()
        .describe("Whether this company is a staffing agency"),
      logo: z
        .object({
          data: z.string().describe("Base64 content"),
          file_name: z.string().describe("Original file name"),
          mime_type: z.string().describe("MIME type (e.g. image/png)"),
          size: z.number().optional().describe("File size in bytes"),
        })
        .optional()
        .describe("Company logo file"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          name: params.name,
          company_owner_email: params.company_owner_email,
          company_owner_name: params.company_owner_name,
        };
        if (params.website !== undefined) body.website = params.website;
        if (params.url !== undefined) body.url = params.url;
        if (params.company_owner_phone !== undefined)
          body.company_owner_phone = params.company_owner_phone;
        if (params.is_staffing_agency !== undefined)
          body.is_staffing_agency = params.is_staffing_agency;
        if (params.logo !== undefined) body.logo = params.logo;

        const result = await apiPost("/companies", body);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- Get company ---
  server.tool(
    "hires_get_company",
    "Get company profile and owner metadata. Use before updates or ownership-sensitive actions.",
    {
      id: z.number().describe("Company ID"),
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/companies/${id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- Update company ---
  server.tool(
    "hires_update_company",
    "Update company profile, owner contact data, and optional logo. Supports partner-operated account management.",
    {
      id: z.number().describe("Company ID"),
      name: z.string().optional().describe("Company name"),
      website: z.string().optional().describe("Company website URL"),
      url: z.string().optional().describe("Company profile URL"),
      company_owner_email: z
        .string()
        .optional()
        .describe("Company owner email address"),
      company_owner_name: z
        .string()
        .optional()
        .describe("Company owner full name"),
      company_owner_phone: z
        .string()
        .optional()
        .describe("Company owner phone number"),
      is_staffing_agency: z
        .boolean()
        .optional()
        .describe("Whether this company is a staffing agency"),
      logo: z
        .object({
          data: z.string().describe("Base64 content"),
          file_name: z.string().describe("Original file name"),
          mime_type: z.string().describe("MIME type (e.g. image/png)"),
          size: z.number().optional().describe("File size in bytes"),
        })
        .optional()
        .describe("Company logo file"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.name !== undefined) body.name = params.name;
        if (params.website !== undefined) body.website = params.website;
        if (params.url !== undefined) body.url = params.url;
        if (params.company_owner_email !== undefined)
          body.company_owner_email = params.company_owner_email;
        if (params.company_owner_name !== undefined)
          body.company_owner_name = params.company_owner_name;
        if (params.company_owner_phone !== undefined)
          body.company_owner_phone = params.company_owner_phone;
        if (params.is_staffing_agency !== undefined)
          body.is_staffing_agency = params.is_staffing_agency;
        if (params.logo !== undefined) body.logo = params.logo;

        const result = await apiPut(`/companies/${params.id}`, body);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- Delete company ---
  server.tool(
    "hires_delete_company",
    "Delete a company. Use for lifecycle control in partner tenancy management.",
    {
      id: z.number().describe("Company ID"),
    },
    async ({ id }) => {
      try {
        const result = await apiDelete(`/companies/${id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- List mail accounts for current company ---
  server.tool(
    "hires_list_company_mail_accounts",
    "List all mail accounts for all users in the current company. Use to resolve `from_account_id` before creating scheduled emails.",
    {
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await apiGet("/companies/mail-accounts", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- List mail accounts for a specific company ---
  server.tool(
    "hires_list_company_id_mail_accounts",
    "List all mail accounts for all users in a specific company. The company must be accessible (own company or a client).",
    {
      id: z.number().describe("Company ID"),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await apiGet(
          `/companies/${params.id}/mail-accounts`,
          query
        );
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- Restore company ---
  server.tool(
    "hires_restore_company",
    "Restore a previously deleted company and re-enable it for active use. Use for recovery and rollback scenarios.",
    {
      id: z.number().describe("Company ID"),
    },
    async ({ id }) => {
      try {
        const result = await apiPatch(`/companies/${id}/restore`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- List company webhooks ---
  server.tool(
    "hires_list_webhooks",
    "List webhook subscriptions configured at company scope.",
    {
      id: z.number().describe("Company ID"),
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/companies/${id}/webhooks`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- Create company webhook ---
  server.tool(
    "hires_create_webhook",
    "Create a company-scoped webhook subscription. Use for outbound company-level event integrations.",
    {
      id: z.number().describe("Company ID"),
      url: z.string().describe("Webhook destination URL. Must be HTTPS."),
    },
    async (params) => {
      try {
        const result = await apiPost(`/companies/${params.id}/webhooks`, {
          url: params.url,
        });
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // --- Delete company webhook ---
  server.tool(
    "hires_delete_webhook",
    "Delete a company-scoped webhook subscription by ID. Use for endpoint retirement and security rotation.",
    {
      id: z.number().describe("Company ID"),
      webhook_id: z.number().describe("Webhook ID"),
    },
    async (params) => {
      try {
        const result = await apiDelete(
          `/companies/${params.id}/webhooks/${params.webhook_id}`
        );
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );
}
