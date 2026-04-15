import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete, toolResult, toolError } from "../client.js";

export function registerEmailTemplateTools(server: McpServer): void {
  server.tool(
    "hires_list_email_templates",
    "List email templates for the target company. Returns paginated results with template name, subject, and body.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID"),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await apiGet("/email-templates", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_create_email_template",
    "Create a new email template with name, subject, and body. Subject and body support placeholders like {{first_name}}, {{job_title}}. To embed placeholders: 1) GET /template-placeholders to list them, 2) POST /template-placeholders/prepare to get the HTML tag, 3) insert the tag into the body.",
    {
      name: z.string().describe("Template name"),
      subject: z
        .string()
        .describe(
          "Email subject line (supports placeholders like {{first_name}}, {{job_title}})"
        ),
      body: z
        .string()
        .describe("Email body HTML (supports placeholders)"),
      company_id: z
        .number()
        .optional()
        .describe("Target company ID"),
    },
    async (params) => {
      try {
        const data: Record<string, unknown> = {
          name: params.name,
          subject: params.subject,
          body: params.body,
        };
        if (params.company_id !== undefined) data.company_id = params.company_id;

        const result = await apiPost("/email-templates", data);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_get_email_template",
    "Get full details of a specific email template by ID, including subject and body content.",
    {
      id: z.number().describe("Email template ID"),
    },
    async (params) => {
      try {
        const result = await apiGet(`/email-templates/${params.id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_update_email_template",
    "Update an existing email template. Only provided fields are overwritten; omitted fields keep their current values. To add placeholders, use the same workflow as creation.",
    {
      id: z.number().describe("Email template ID"),
      name: z.string().optional().describe("Template name"),
      subject: z
        .string()
        .optional()
        .describe("Email subject line (supports placeholders)"),
      body: z
        .string()
        .optional()
        .describe("Email body HTML (supports placeholders)"),
    },
    async (params) => {
      try {
        const data: Record<string, unknown> = {};
        if (params.name !== undefined) data.name = params.name;
        if (params.subject !== undefined) data.subject = params.subject;
        if (params.body !== undefined) data.body = params.body;

        const result = await apiPut(`/email-templates/${params.id}`, data);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_delete_email_template",
    "Soft-delete an email template. Templates already used in automations will stop being available for new actions.",
    {
      id: z.number().describe("Email template ID"),
    },
    async (params) => {
      try {
        const result = await apiDelete(`/email-templates/${params.id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );
}
