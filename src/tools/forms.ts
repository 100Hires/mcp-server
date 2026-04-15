import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete, toolResult, toolError } from "../client.js";

export function registerFormTools(server: McpServer): void {
  server.tool(
    "hires_list_forms",
    "List application forms (paginated). Returns forms with their questions for the target company.",
    {
      company_id: z.number().optional().describe("Target company ID."),
      page: z.number().optional().describe("Page number."),
      size: z.number().optional().describe("Page size."),
    },
    async ({ company_id, page, size }) => {
      const params: Record<string, unknown> = {};
      if (company_id !== undefined) params.company_id = company_id;
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;

      const result = await apiGet("/forms", params);
      return toolResult(result);
    }
  );

  server.tool(
    "hires_create_form",
    "Create a new application form, optionally attaching existing questions by ID.",
    {
      name: z.string().describe("Form name."),
      company_id: z.number().optional().describe("Target company ID."),
      questions: z
        .array(z.number())
        .optional()
        .describe("Array of question IDs to attach to this form."),
    },
    async ({ name, company_id, questions }) => {
      const body: Record<string, unknown> = { name };
      if (company_id !== undefined) body.company_id = company_id;
      if (questions !== undefined) body.questions = questions;

      const result = await apiPost("/forms", body);
      return toolResult(result);
    }
  );

  server.tool(
    "hires_get_form",
    "Get form details including all questions with their statuses.",
    {
      id: z.number().describe("Form ID."),
    },
    async ({ id }) => {
      const result = await apiGet(`/forms/${id}`);
      return toolResult(result);
    }
  );

  server.tool(
    "hires_update_form",
    "Update form name and question composition.",
    {
      id: z.number().describe("Form ID."),
      name: z.string().describe("Form name."),
      questions: z
        .array(z.number())
        .optional()
        .describe("Array of question IDs to attach to this form."),
    },
    async ({ id, name, questions }) => {
      const body: Record<string, unknown> = { name };
      if (questions !== undefined) body.questions = questions;

      const result = await apiPut(`/forms/${id}`, body);
      return toolResult(result);
    }
  );

  server.tool(
    "hires_delete_form",
    "Delete an application form.",
    {
      id: z.number().describe("Form ID."),
    },
    async ({ id }) => {
      const result = await apiDelete(`/forms/${id}`);
      return toolResult(result);
    }
  );

  server.tool(
    "hires_update_form_question",
    "Update the status (required/optional/hidden) of a question inside a form.",
    {
      form_id: z.number().describe("Form ID."),
      question_id: z.number().describe("Question ID."),
      status: z
        .enum(["required", "optional", "hidden"])
        .describe("Question visibility on this form: required, optional, or hidden."),
    },
    async ({ form_id, question_id, status }) => {
      const result = await apiPut(
        `/forms/${form_id}/questions/${question_id}`,
        { status }
      );
      return toolResult(result);
    }
  );
}
