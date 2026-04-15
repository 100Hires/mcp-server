import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, toolResult, toolError } from "../client.js";

export function registerJobTools(server: McpServer): void {
  // ── hires_list_jobs ────────────────────────────────────────────
  server.tool(
    "hires_list_jobs",
    "List jobs with optional filters by status, date range, department, or search query. Returns paginated results. Use for career-site sync, reporting, and external system indexing.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Filter by company ID (required only for multi-company API keys)"),
      status: z
        .string()
        .optional()
        .describe(
          "Filter by job status name (from GET /taxonomy/statuses, e.g. Public, Draft, Archived)"
        ),
      created_at_start: z
        .number()
        .optional()
        .describe("Return only jobs created at or after this Unix timestamp (seconds)"),
      created_at_end: z
        .number()
        .optional()
        .describe("Return only jobs created at or before this Unix timestamp (seconds)"),
      updated_after: z
        .number()
        .optional()
        .describe(
          "Return only jobs updated after this Unix timestamp (seconds). Use for incremental sync."
        ),
      department_id: z
        .number()
        .optional()
        .describe("Filter jobs by department ID (from GET /taxonomy/departments)"),
      q: z
        .string()
        .optional()
        .describe("Search by job title or internal title (partial match)"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to embed: workflow, hiring_team, pipeline_stages"
        ),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 20)"),
    },
    async ({
      company_id,
      status,
      created_at_start,
      created_at_end,
      updated_after,
      department_id,
      q,
      include,
      page,
      size,
    }) => {
      const params: Record<string, unknown> = {};
      if (company_id !== undefined) params.company_id = company_id;
      if (status !== undefined) params.status = status;
      if (created_at_start !== undefined) params.created_at_start = created_at_start;
      if (created_at_end !== undefined) params.created_at_end = created_at_end;
      if (updated_after !== undefined) params.updated_after = updated_after;
      if (department_id !== undefined) params.department_id = department_id;
      if (q !== undefined) params.q = q;
      if (include !== undefined) params.include = include;
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;

      const text = await apiGet("/jobs", params);
      return toolResult(text);
    }
  );

  // ── hires_create_job ───────────────────────────────────────────
  server.tool(
    "hires_create_job",
    "Create a job with taxonomy, location, salary, and workflow configuration. Primary endpoint for programmatic job publishing. Required fields: status, title, description, location_city, location_country.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID. Required only when the API key has access to multiple companies."),
      form_id: z
        .number()
        .optional()
        .describe(
          "Application form ID. If omitted, a new form named after the job title is created with default questions."
        ),
      status: z.string().describe("Job status (e.g. Draft, Public). See GET /taxonomy/statuses."),
      title: z.string().describe("Public job title."),
      internal_title: z
        .string()
        .optional()
        .describe("Internal-only title visible to the hiring team."),
      internal_job_id: z
        .string()
        .optional()
        .describe("External reference ID from your ATS or HR system."),
      description: z.string().describe("Job description (HTML allowed)."),
      resume_field_status: z
        .enum(["required", "optional", "hidden"])
        .optional()
        .describe("Resume field behavior on the application form."),
      location_city: z.string().describe("Job city."),
      location_country: z.string().describe("Job country."),
      location_state: z.string().optional().describe("Job state or region."),
      location_street_address: z.string().optional().describe("Street address."),
      location_full_address: z.string().optional().describe("Full formatted address."),
      location_postal_code: z.string().optional().describe("Postal or ZIP code."),
      salary_min: z.number().optional().describe("Minimum salary."),
      salary_max: z.number().optional().describe("Maximum salary."),
      salary_currency: z
        .string()
        .optional()
        .describe("Salary currency code (e.g. USD, EUR)."),
      salary_period: z
        .enum(["annually", "monthly", "daily", "hourly"])
        .optional()
        .describe("Salary period."),
      is_remote: z.boolean().optional().describe("Whether this is a remote position."),
      employment_type_id: z
        .number()
        .optional()
        .describe("Employment type ID from GET /taxonomy/employment-types."),
      department_id: z
        .number()
        .optional()
        .describe("Department ID from GET /taxonomy/departments."),
      category_id: z
        .number()
        .optional()
        .describe("Job category ID from GET /taxonomy/categories."),
      education_level_id: z
        .number()
        .optional()
        .describe("Education level ID from GET /taxonomy/education-levels."),
      experience_level_id: z
        .number()
        .optional()
        .describe("Experience level ID from GET /taxonomy/experience-levels."),
      workflow_id: z
        .number()
        .optional()
        .describe(
          "Workflow ID. If omitted, a new workflow named after the job title is created with default stages."
        ),
      parent_job_id: z
        .number()
        .optional()
        .describe("Canonical parent job ID. If provided, the created job becomes a satellite job."),
      knockout_questions: z
        .array(
          z.object({
            text: z.string().describe("Question text shown to the applicant."),
            expected_answer: z
              .enum(["Yes", "No"])
              .describe("The correct/desired answer."),
            disqualify_on_wrong_answer: z
              .boolean()
              .describe(
                "If true, applicants who answer incorrectly are automatically disqualified."
              ),
          })
        )
        .optional()
        .describe(
          "Boolean knockout questions added to the application form."
        ),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to embed: workflow, hiring_team, pipeline_stages"
        ),
    },
    async ({
      company_id,
      form_id,
      status,
      title,
      internal_title,
      internal_job_id,
      description,
      resume_field_status,
      location_city,
      location_country,
      location_state,
      location_street_address,
      location_full_address,
      location_postal_code,
      salary_min,
      salary_max,
      salary_currency,
      salary_period,
      is_remote,
      employment_type_id,
      department_id,
      category_id,
      education_level_id,
      experience_level_id,
      workflow_id,
      parent_job_id,
      knockout_questions,
      include,
    }) => {
      const queryParams: Record<string, unknown> = {};
      if (include !== undefined) queryParams.include = include;

      const data: Record<string, unknown> = {
        status,
        title,
        description,
        location_city,
        location_country,
      };
      if (company_id !== undefined) data.company_id = company_id;
      if (form_id !== undefined) data.form_id = form_id;
      if (internal_title !== undefined) data.internal_title = internal_title;
      if (internal_job_id !== undefined) data.internal_job_id = internal_job_id;
      if (resume_field_status !== undefined) data.resume_field_status = resume_field_status;
      if (location_state !== undefined) data.location_state = location_state;
      if (location_street_address !== undefined)
        data.location_street_address = location_street_address;
      if (location_full_address !== undefined)
        data.location_full_address = location_full_address;
      if (location_postal_code !== undefined)
        data.location_postal_code = location_postal_code;
      if (salary_min !== undefined) data.salary_min = salary_min;
      if (salary_max !== undefined) data.salary_max = salary_max;
      if (salary_currency !== undefined) data.salary_currency = salary_currency;
      if (salary_period !== undefined) data.salary_period = salary_period;
      if (is_remote !== undefined) data.is_remote = is_remote;
      if (employment_type_id !== undefined) data.employment_type_id = employment_type_id;
      if (department_id !== undefined) data.department_id = department_id;
      if (category_id !== undefined) data.category_id = category_id;
      if (education_level_id !== undefined) data.education_level_id = education_level_id;
      if (experience_level_id !== undefined)
        data.experience_level_id = experience_level_id;
      if (workflow_id !== undefined) data.workflow_id = workflow_id;
      if (parent_job_id !== undefined) data.parent_job_id = parent_job_id;
      if (knockout_questions !== undefined) data.knockout_questions = knockout_questions;

      const text = await apiPost("/jobs", data, queryParams);
      return toolResult(text);
    }
  );

  // ── hires_get_job ──────────────────────────────────────────────
  server.tool(
    "hires_get_job",
    "Get full details of a job by ID or alias. Use `include` to load related workflow, hiring team, or pipeline stages data.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to embed: workflow, hiring_team, pipeline_stages"
        ),
    },
    async ({ id, include }) => {
      const params: Record<string, unknown> = {};
      if (include !== undefined) params.include = include;

      const text = await apiGet(`/jobs/${id}`, params);
      return toolResult(text);
    }
  );

  // ── hires_update_job ───────────────────────────────────────────
  server.tool(
    "hires_update_job",
    "Update mutable job attributes. Only send fields you want to change. Preserves domain-level validation rules.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
      form_id: z
        .number()
        .optional()
        .describe("Application form ID to assign to this job."),
      status: z
        .string()
        .optional()
        .describe("Job status (e.g. Draft, Public). See GET /taxonomy/statuses."),
      title: z.string().optional().describe("Public job title."),
      internal_title: z
        .string()
        .optional()
        .describe("Internal-only title visible to the hiring team."),
      internal_job_id: z
        .string()
        .optional()
        .describe("External reference ID from your ATS or HR system."),
      description: z.string().optional().describe("Job description (HTML allowed)."),
      resume_field_status: z
        .enum(["required", "optional", "hidden"])
        .optional()
        .describe("Resume field behavior on the application form."),
      location_city: z.string().optional().describe("Job city."),
      location_country: z.string().optional().describe("Job country."),
      location_state: z.string().optional().describe("Job state or region."),
      location_street_address: z.string().optional().describe("Street address."),
      location_full_address: z.string().optional().describe("Full formatted address."),
      location_postal_code: z.string().optional().describe("Postal or ZIP code."),
      salary_min: z.number().optional().describe("Minimum salary."),
      salary_max: z.number().optional().describe("Maximum salary."),
      salary_currency: z
        .string()
        .optional()
        .describe("Salary currency code (e.g. USD, EUR)."),
      salary_period: z
        .enum(["annually", "monthly", "daily", "hourly"])
        .optional()
        .describe("Salary period."),
      is_remote: z.boolean().optional().describe("Whether this is a remote position."),
      employment_type_id: z
        .number()
        .optional()
        .describe("Employment type ID from GET /taxonomy/employment-types."),
      department_id: z
        .number()
        .optional()
        .describe("Department ID from GET /taxonomy/departments."),
      category_id: z
        .number()
        .optional()
        .describe("Job category ID from GET /taxonomy/categories."),
      education_level_id: z
        .number()
        .optional()
        .describe("Education level ID from GET /taxonomy/education-levels."),
      experience_level_id: z
        .number()
        .optional()
        .describe("Experience level ID from GET /taxonomy/experience-levels."),
      workflow_id: z.number().optional().describe("Workflow ID to assign to this job."),
      parent_job_id: z
        .number()
        .optional()
        .describe(
          "Canonical parent job ID. If provided, the job becomes a satellite job."
        ),
      knockout_questions: z
        .array(
          z.object({
            text: z.string().describe("Question text shown to the applicant."),
            expected_answer: z
              .enum(["Yes", "No"])
              .describe("The correct/desired answer."),
            disqualify_on_wrong_answer: z
              .boolean()
              .describe(
                "If true, applicants who answer incorrectly are automatically disqualified."
              ),
          })
        )
        .optional()
        .describe("Boolean knockout questions added to the application form."),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to embed: workflow, hiring_team, pipeline_stages"
        ),
    },
    async ({
      id,
      form_id,
      status,
      title,
      internal_title,
      internal_job_id,
      description,
      resume_field_status,
      location_city,
      location_country,
      location_state,
      location_street_address,
      location_full_address,
      location_postal_code,
      salary_min,
      salary_max,
      salary_currency,
      salary_period,
      is_remote,
      employment_type_id,
      department_id,
      category_id,
      education_level_id,
      experience_level_id,
      workflow_id,
      parent_job_id,
      knockout_questions,
      include,
    }) => {
      const queryParams: Record<string, unknown> = {};
      if (include !== undefined) queryParams.include = include;

      const data: Record<string, unknown> = {};
      if (form_id !== undefined) data.form_id = form_id;
      if (status !== undefined) data.status = status;
      if (title !== undefined) data.title = title;
      if (internal_title !== undefined) data.internal_title = internal_title;
      if (internal_job_id !== undefined) data.internal_job_id = internal_job_id;
      if (description !== undefined) data.description = description;
      if (resume_field_status !== undefined) data.resume_field_status = resume_field_status;
      if (location_city !== undefined) data.location_city = location_city;
      if (location_country !== undefined) data.location_country = location_country;
      if (location_state !== undefined) data.location_state = location_state;
      if (location_street_address !== undefined)
        data.location_street_address = location_street_address;
      if (location_full_address !== undefined)
        data.location_full_address = location_full_address;
      if (location_postal_code !== undefined)
        data.location_postal_code = location_postal_code;
      if (salary_min !== undefined) data.salary_min = salary_min;
      if (salary_max !== undefined) data.salary_max = salary_max;
      if (salary_currency !== undefined) data.salary_currency = salary_currency;
      if (salary_period !== undefined) data.salary_period = salary_period;
      if (is_remote !== undefined) data.is_remote = is_remote;
      if (employment_type_id !== undefined) data.employment_type_id = employment_type_id;
      if (department_id !== undefined) data.department_id = department_id;
      if (category_id !== undefined) data.category_id = category_id;
      if (education_level_id !== undefined) data.education_level_id = education_level_id;
      if (experience_level_id !== undefined)
        data.experience_level_id = experience_level_id;
      if (workflow_id !== undefined) data.workflow_id = workflow_id;
      if (parent_job_id !== undefined) data.parent_job_id = parent_job_id;
      if (knockout_questions !== undefined) data.knockout_questions = knockout_questions;

      const text = await apiPut(`/jobs/${id}`, data, queryParams);
      return toolResult(text);
    }
  );

  // ── hires_delete_job ───────────────────────────────────────────
  server.tool(
    "hires_delete_job",
    "Delete a job. Use to align archived/removed positions across integrated platforms.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
    },
    async ({ id }) => {
      const text = await apiDelete(`/jobs/${id}`);
      return toolResult(text);
    }
  );

  // ── hires_set_job_status ───────────────────────────────────────
  server.tool(
    "hires_set_job_status",
    "Change job status via dedicated endpoint. Recommended for publish/unpublish/archive transitions and status automation workflows.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
      status: z
        .string()
        .describe(
          "New job status (e.g. Draft, Public, Archived). See GET /taxonomy/statuses."
        ),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to embed: workflow, hiring_team, pipeline_stages"
        ),
    },
    async ({ id, status, include }) => {
      const queryParams: Record<string, unknown> = {};
      if (include !== undefined) queryParams.include = include;

      const text = await apiPatch(`/jobs/${id}/status`, { status }, queryParams);
      return toolResult(text);
    }
  );

  // ── hires_list_job_boards ──────────────────────────────────────
  server.tool(
    "hires_list_job_boards",
    "Get current board publication state for a specific job. Returns which job boards the job is published to. Useful for distribution dashboards and posting audits.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
    },
    async ({ id }) => {
      const text = await apiGet(`/jobs/${id}/job-boards`);
      return toolResult(text);
    }
  );

  // ── hires_publish_to_job_board ─────────────────────────────────
  server.tool(
    "hires_publish_to_job_board",
    "Activate selected job boards for a job. Sets boards to activation queue state. Use for controlled multi-board publishing workflows.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
      boards: z
        .array(z.string())
        .optional()
        .describe("Array of board identifiers to activate (e.g. ['indeed', 'linkedin'])"),
    },
    async ({ id, boards }) => {
      const data: Record<string, unknown> = {};
      if (boards !== undefined) data.boards = boards;

      const text = await apiPost(`/jobs/${id}/job-boards`, data);
      return toolResult(text);
    }
  );

  // ── hires_remove_from_job_board ────────────────────────────────
  server.tool(
    "hires_remove_from_job_board",
    "Deactivate selected board publications for a job. Stops the job from being listed on specified boards.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
      boards: z
        .array(z.string())
        .optional()
        .describe("Array of board identifiers to deactivate (e.g. ['indeed', 'linkedin'])"),
    },
    async ({ id, boards }) => {
      const data: Record<string, unknown> = {};
      if (boards !== undefined) data.boards = boards;

      const text = await apiDelete(`/jobs/${id}/job-boards`, undefined, data);
      return toolResult(text);
    }
  );

  // ── hires_batch_job_boards ─────────────────────────────────────
  server.tool(
    "hires_batch_job_boards",
    "Get board publication states for multiple jobs in one request. Optimized for batch monitoring and management UIs.",
    {
      jobs: z
        .array(z.number())
        .describe("Array of job IDs"),
    },
    async ({ jobs }) => {
      const text = await apiGet("/jobs/batch-job-boards", { jobs });
      return toolResult(text);
    }
  );

  // ── hires_batch_publish_to_boards ──────────────────────────────
  server.tool(
    "hires_batch_publish_to_boards",
    "Activate board publication for multiple jobs in one request. Use for bulk job distribution workflows.",
    {
      jobs: z
        .array(z.number())
        .describe("Array of job IDs to publish"),
      boards: z
        .array(z.string())
        .optional()
        .describe("Array of board identifiers to activate (e.g. ['indeed', 'linkedin'])"),
    },
    async ({ jobs, boards }) => {
      const data: Record<string, unknown> = { jobs };
      if (boards !== undefined) data.boards = boards;

      const text = await apiPost("/jobs/batch-job-boards", data);
      return toolResult(text);
    }
  );

  // ── hires_batch_remove_from_boards ─────────────────────────────
  server.tool(
    "hires_batch_remove_from_boards",
    "Deactivate board publication for multiple jobs in one request. Use for bulk depublishing workflows.",
    {
      jobs: z
        .array(z.number())
        .describe("Array of job IDs to depublish"),
      boards: z
        .array(z.string())
        .optional()
        .describe("Array of board identifiers to deactivate (e.g. ['indeed', 'linkedin'])"),
    },
    async ({ jobs, boards }) => {
      const data: Record<string, unknown> = { jobs };
      if (boards !== undefined) data.boards = boards;

      const text = await apiDelete("/jobs/batch-job-boards", undefined, data);
      return toolResult(text);
    }
  );

  // ── hires_list_hiring_team ─────────────────────────────────────
  server.tool(
    "hires_list_hiring_team",
    "List users currently assigned to a job's hiring team. Useful for notification routing and collaboration tooling.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
    },
    async ({ id }) => {
      const text = await apiGet(`/jobs/${id}/hiring-team`);
      return toolResult(text);
    }
  );

  // ── hires_add_hiring_team_member ───────────────────────────────
  server.tool(
    "hires_add_hiring_team_member",
    "Add a company member to the job's hiring team. Use in workflow setup and ownership automation.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
      user_id: z.number().describe("User ID to add to the hiring team."),
    },
    async ({ id, user_id }) => {
      const text = await apiPost(`/jobs/${id}/hiring-team`, { user_id });
      return toolResult(text);
    }
  );

  // ── hires_list_job_webhooks ────────────────────────────────────
  server.tool(
    "hires_list_job_webhooks",
    "List webhooks configured for job-level events. Use to audit subscriptions and deployment state.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
    },
    async ({ id }) => {
      const text = await apiGet(`/jobs/${id}/webhooks`);
      return toolResult(text);
    }
  );

  // ── hires_create_job_webhook ───────────────────────────────────
  server.tool(
    "hires_create_job_webhook",
    "Register a webhook URL for job-related events. Core step for outbound integration setup. URL must be HTTPS.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
      url: z.string().describe("Webhook destination URL. Must be HTTPS."),
    },
    async ({ id, url }) => {
      const text = await apiPost(`/jobs/${id}/webhooks`, { url });
      return toolResult(text);
    }
  );

  // ── hires_delete_job_webhook ───────────────────────────────────
  server.tool(
    "hires_delete_job_webhook",
    "Delete a job webhook subscription by ID. Use for cleanup, rotation, and endpoint migration.",
    {
      id: z
        .union([z.string(), z.number()])
        .describe("Job ID (numeric) or alias"),
      webhook_id: z
        .number()
        .describe("Webhook ID to delete"),
    },
    async ({ id, webhook_id }) => {
      const text = await apiDelete(`/jobs/${id}/webhooks/${webhook_id}`);
      return toolResult(text);
    }
  );
}
