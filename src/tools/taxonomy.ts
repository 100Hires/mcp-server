import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete, toolResult, toolError } from "../client.js";

export function registerTaxonomyTools(server: McpServer): void {
  // ── Sources ──────────────────────────────────────────────────────────
  server.tool(
    "hires_list_sources",
    "List candidate sources for the company. Use for attribution sync and reporting consistency.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        const result = await apiGet("/sources", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Origins ──────────────────────────────────────────────────────────
  server.tool(
    "hires_list_origins",
    "List candidate origin taxonomy values. Use for attribution analytics and source normalization.",
    async () => {
      try {
        const result = await apiGet("/origins");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Rejection Reasons ────────────────────────────────────────────────
  server.tool(
    "hires_list_rejection_reasons",
    "List configured rejection reasons for the company. Use to validate rejection actions and analytics.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        const result = await apiGet("/rejection-reasons", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Statuses ─────────────────────────────────────────────────────────
  server.tool(
    "hires_list_statuses",
    "List job status labels (draft, published, on_hold, closed, archived). Cache to validate job status updates.",
    async () => {
      try {
        const result = await apiGet("/statuses");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Departments ──────────────────────────────────────────────────────
  server.tool(
    "hires_list_departments",
    "List departments for the company. Use for job organization filters and reporting dimensions.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        const result = await apiGet("/departments", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Categories ───────────────────────────────────────────────────────
  server.tool(
    "hires_list_categories",
    "List global job categories. Use for job classification and consistent taxonomy mapping.",
    async () => {
      try {
        const result = await apiGet("/categories");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Education Levels ─────────────────────────────────────────────────
  server.tool(
    "hires_list_education_levels",
    "List education level taxonomy values. Useful for job requirements and structured matching.",
    async () => {
      try {
        const result = await apiGet("/education-levels");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Experience Levels ────────────────────────────────────────────────
  server.tool(
    "hires_list_experience_levels",
    "List experience level taxonomy values for role seniority modeling.",
    async () => {
      try {
        const result = await apiGet("/experience-levels");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Employment Types ─────────────────────────────────────────────────
  server.tool(
    "hires_list_employment_types",
    "List supported employment types (full-time, part-time, contract, etc.). Use for validation and normalization.",
    async () => {
      try {
        const result = await apiGet("/employment-types");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Boards ───────────────────────────────────────────────────────────
  server.tool(
    "hires_list_boards",
    "List available publishing boards with metadata. Use for distribution setup and board selection.",
    async () => {
      try {
        const result = await apiGet("/boards");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Tags ─────────────────────────────────────────────────────────────
  server.tool(
    "hires_list_tags",
    "List all tags for the company. Returns paginated results. Recommended to cache for fast tagging UX.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        const result = await apiGet("/tags", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Workflows ────────────────────────────────────────────────────────
  server.tool(
    "hires_list_workflows",
    "List workflows with embedded stages for the company. Use to build stage-aware integrations and routing rules.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        const result = await apiGet("/workflows", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Workflow Stages (filtered) ───────────────────────────────────────
  server.tool(
    "hires_list_workflow_stages",
    "List pipeline stages filtered by workflow or job. Useful for transition UIs and workflow validation.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
      workflow_id: z
        .number()
        .optional()
        .describe("Filter stages by workflow ID (from hires_list_workflows)"),
      job_id: z
        .number()
        .optional()
        .describe(
          "Filter stages by job ID (returns stages from the job's assigned workflow)"
        ),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        if (params.workflow_id !== undefined)
          query.workflow_id = params.workflow_id;
        if (params.job_id !== undefined) query.job_id = params.job_id;
        const result = await apiGet("/workflows/stages", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Workflow Stages by ID ────────────────────────────────────────────
  server.tool(
    "hires_get_workflow_stages",
    "Get stages for a specific workflow by ID. Equivalent to hires_list_workflow_stages with workflow_id filter.",
    {
      id: z.number().describe("Workflow ID"),
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        const result = await apiGet(
          `/workflows/${params.id}/stages`,
          query
        );
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Questions ────────────────────────────────────────────────────────
  server.tool(
    "hires_list_questions",
    "List paginated question catalog for the company.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;
        const result = await apiGet("/questions", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_create_question",
    "Create a reusable question with optional answer options for dropdown types. Used by forms and questionnaires.",
    {
      text: z.string().describe("Question text"),
      type: z
        .string()
        .describe("Question type (from hires_list_question_types)"),
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
      options: z
        .array(z.string())
        .optional()
        .describe("Answer options (for select/multiselect question types)"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          text: params.text,
          type: params.type,
        };
        if (params.company_id !== undefined) body.company_id = params.company_id;
        if (params.options !== undefined) body.options = params.options;
        const result = await apiPost("/questions", body);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_get_question",
    "Get a question definition including type and options by ID.",
    {
      id: z.number().describe("Question ID"),
    },
    async (params) => {
      try {
        const result = await apiGet(`/questions/${params.id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_update_question",
    "Update text, type, or options of an existing question definition.",
    {
      id: z.number().describe("Question ID"),
      text: z.string().describe("Question text"),
      type: z
        .string()
        .describe("Question type (from hires_list_question_types)"),
      options: z
        .array(z.string())
        .optional()
        .describe("Answer options (for select/multiselect question types)"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          text: params.text,
          type: params.type,
        };
        if (params.options !== undefined) body.options = params.options;
        const result = await apiPut(`/questions/${params.id}`, body);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_delete_question",
    "Delete a reusable question from the catalog. Use cautiously when deprecating question banks.",
    {
      id: z.number().describe("Question ID"),
    },
    async (params) => {
      try {
        const result = await apiDelete(`/questions/${params.id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Question Types ───────────────────────────────────────────────────
  server.tool(
    "hires_list_question_types",
    "List available question types supported by the platform. Use to drive dynamic form builders.",
    async () => {
      try {
        const result = await apiGet("/questions/types");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Template Placeholders ────────────────────────────────────────────
  server.tool(
    "hires_list_template_placeholders",
    "List available placeholders for email templates with pagination. Use `type` to filter by category, `q` to search by label. Discover placeholders here, then use hires_prepare_template_placeholders to get an HTML tag for insertion.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (uses default company when omitted)"),
      type: z
        .enum([
          "profile_field",
          "job_variable",
          "questionnaire_link",
          "self_scheduling_link",
        ])
        .optional()
        .describe("Filter by placeholder type"),
      is_notification: z
        .number()
        .optional()
        .describe(
          "Include notification-specific system placeholders (0 or 1, default 0)"
        ),
      q: z
        .string()
        .optional()
        .describe(
          "Filter placeholders by label (case-insensitive substring match)"
        ),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        if (params.type !== undefined) query.type = params.type;
        if (params.is_notification !== undefined)
          query.is_notification = params.is_notification;
        if (params.q !== undefined) query.q = params.q;
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;
        const result = await apiGet("/template-placeholders", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_prepare_template_placeholders",
    "Convert a placeholder reference into an HTML tag for insertion into an email template body.",
    {
      type: z
        .string()
        .describe(
          "Placeholder type (system, candidate_column, job_variable, questionnaire_link, scheduling_link)"
        ),
      identifier: z
        .string()
        .optional()
        .describe("Placeholder identifier"),
      qas_profile_question_id: z
        .number()
        .optional()
        .describe("Profile question ID"),
      form_question_id: z
        .number()
        .optional()
        .describe("Form question ID"),
      system_column_title: z
        .string()
        .optional()
        .describe("System column title"),
      job_variable_id: z
        .number()
        .optional()
        .describe("Job variable ID"),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = { type: params.type };
        if (params.identifier !== undefined)
          body.identifier = params.identifier;
        if (params.qas_profile_question_id !== undefined)
          body.qas_profile_question_id = params.qas_profile_question_id;
        if (params.form_question_id !== undefined)
          body.form_question_id = params.form_question_id;
        if (params.system_column_title !== undefined)
          body.system_column_title = params.system_column_title;
        if (params.job_variable_id !== undefined)
          body.job_variable_id = params.job_variable_id;
        const result = await apiPost("/template-placeholders/prepare", body);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── Billing ──────────────────────────────────────────────────────────
  server.tool(
    "hires_get_billing",
    "Get billing/pricing capability flags for the current company. Use before invoking paid-only API behaviors.",
    async () => {
      try {
        const result = await apiGet("/billing");
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );
}
