import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete, toolResult, toolError } from "../client.js";

export function registerApplicationTools(server: McpServer): void {
  // ---------------------------------------------------------------------------
  // hires_list_applications  GET /applications
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_list_applications",
    "List applications across all accessible jobs. Supports filtering by candidate, job, stage, status, AI score range, and date ranges. Use for pipeline analytics, sync jobs, and ATS dashboards.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Filter by company ID. Omit for all accessible companies."),
      candidate_id: z
        .number()
        .optional()
        .describe("Filter applications by candidate ID."),
      job_id: z
        .number()
        .optional()
        .describe("Filter applications by job ID."),
      stage_id: z
        .number()
        .optional()
        .describe(
          "Filter applications by pipeline stage ID. Best used together with job_id."
        ),
      status: z
        .enum(["pending", "hired", "rejected"])
        .optional()
        .describe(
          "Filter by application status: pending (active), hired, or rejected."
        ),
      created_after: z
        .number()
        .optional()
        .describe(
          "Return only applications created after this Unix timestamp (seconds)."
        ),
      updated_after: z
        .number()
        .optional()
        .describe(
          "Return only applications updated after this Unix timestamp (seconds). Use for incremental sync."
        ),
      ai_score_min: z
        .number()
        .optional()
        .describe(
          "Return only applications with ai_score >= this value."
        ),
      ai_score_max: z
        .number()
        .optional()
        .describe(
          "Return only applications with ai_score <= this value."
        ),
      sort: z
        .enum(["created_at", "-created_at", "ai_score", "-ai_score"])
        .optional()
        .describe(
          "Sort order. Prefix with - for descending. Default: -created_at."
        ),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text. Example: candidate,cv.text"
        ),
      page: z.number().optional().describe("Page number (default 1)."),
      size: z
        .number()
        .optional()
        .describe("Items per page (default 25, max 100)."),
    },
    async (params) => {
      try {
        const result = await apiGet("/applications", params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_create_application  POST /applications
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_create_application",
    "Create an application by linking an existing candidate to a job. Use for sourcing workflows and manual application ingestion. The candidate must already exist.",
    {
      candidate_id: z
        .union([z.string(), z.number()])
        .describe("Candidate ID (numeric) or alias."),
      job_id: z.number().describe("Job ID to apply the candidate to."),
      stage_id: z
        .number()
        .optional()
        .describe(
          "Pipeline stage ID. If omitted, defaults to the first stage."
        ),
      cv: z
        .object({
          data: z.string().describe("Base64-encoded file content."),
          file_name: z.string().describe("Original file name."),
          mime_type: z.string().describe("MIME type (e.g. application/pdf)."),
        })
        .optional()
        .describe("Optional CV/resume to attach."),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ include, ...body }) => {
      try {
        const result = await apiPost("/applications", body, include ? { include } : undefined);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_get_application  GET /applications/{id}
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_get_application",
    "Get full application details including stage, status, and rejection context. Recommended before mutating stage transitions.",
    {
      id: z
        .number()
        .describe("Application ID."),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ id, include }) => {
      try {
        const result = await apiGet(`/applications/${id}`, include ? { include } : undefined);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_update_application  PUT /applications/{id}
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_update_application",
    "Update application fields such as stage, disqualification flag, and CV. For explicit stage transitions prefer hires_move_application or hires_advance_application.",
    {
      id: z
        .number()
        .describe("Application ID."),
      stage_id: z
        .number()
        .optional()
        .describe("Move application to this pipeline stage."),
      is_disqualified: z
        .boolean()
        .optional()
        .describe(
          "Set to true to disqualify the candidate on this application."
        ),
      cv: z
        .object({
          data: z.string().describe("Base64-encoded file content."),
          file_name: z.string().describe("Original file name."),
          mime_type: z.string().describe("MIME type (e.g. application/pdf)."),
        })
        .optional()
        .describe("Replace or attach a CV."),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ id, include, ...body }) => {
      try {
        const result = await apiPut(
          `/applications/${id}`,
          body,
          include ? { include } : undefined
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_delete_application  DELETE /applications/{id}
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_delete_application",
    "Permanently delete an application. This removes it from all list and view queries.",
    {
      id: z
        .number()
        .describe("Application ID."),
    },
    async ({ id }) => {
      try {
        const result = await apiDelete(`/applications/${id}`);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_move_application  POST /applications/{id}/move
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_move_application",
    "Move an application to a specific pipeline stage. Use this for explicit stage transitions in workflow orchestration. You need the target stage_id (get it from the job's pipeline_stages).",
    {
      id: z
        .number()
        .describe("Application ID."),
      stage_id: z.number().describe("Target pipeline stage ID."),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ id, include, ...body }) => {
      try {
        const result = await apiPost(
          `/applications/${id}/move`,
          body,
          include ? { include } : undefined
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_advance_application  POST /applications/{id}/advance
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_advance_application",
    "Advance an application to the next pipeline stage according to workflow order. No stage_id needed -- the system determines the next stage automatically.",
    {
      id: z
        .number()
        .describe("Application ID."),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ id, include }) => {
      try {
        const result = await apiPost(
          `/applications/${id}/advance`,
          undefined,
          include ? { include } : undefined
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_hire_application  POST /applications/{id}/hire
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_hire_application",
    "Mark an application as hired. This is the finalization step in a hiring workflow. The application status changes to 'hired' and hired_at is set.",
    {
      id: z
        .number()
        .describe("Application ID."),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ id, include }) => {
      try {
        const result = await apiPost(
          `/applications/${id}/hire`,
          undefined,
          include ? { include } : undefined
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_reject_application  POST /applications/{id}/reject
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_reject_application",
    "Reject an application with an optional rejection reason. Use GET /taxonomy/rejection-reasons to list available reason IDs. Set suppress_notification to skip the rejection email.",
    {
      id: z
        .number()
        .describe("Application ID."),
      rejection_reason_id: z
        .number()
        .optional()
        .describe(
          "Rejection reason ID from GET /taxonomy/rejection-reasons."
        ),
      suppress_notification: z
        .boolean()
        .optional()
        .describe(
          "Set to true to skip sending the rejection email to the candidate."
        ),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ id, include, ...body }) => {
      try {
        const hasBody = body.rejection_reason_id !== undefined || body.suppress_notification !== undefined;
        const result = await apiPost(
          `/applications/${id}/reject`,
          hasBody ? body : undefined,
          include ? { include } : undefined
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_unreject_application  POST /applications/{id}/unreject
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_unreject_application",
    "Undo a rejection and reopen a previously rejected application. The status returns to active and rejected_at is cleared.",
    {
      id: z
        .number()
        .describe("Application ID."),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ id, include }) => {
      try {
        const result = await apiPost(
          `/applications/${id}/unreject`,
          undefined,
          include ? { include } : undefined
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_transfer_application  POST /applications/{id}/transfer
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_transfer_application",
    "Transfer an application to another job. A new application is created on the target job. Optionally specify a stage on the target job's pipeline.",
    {
      id: z
        .number()
        .describe("Application ID to transfer."),
      job_id: z.number().describe("Target job ID to transfer the application to."),
      stage_id: z
        .number()
        .optional()
        .describe(
          "Pipeline stage ID on the target job. If omitted, defaults to the first stage."
        ),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, cv.text."
        ),
    },
    async ({ id, include, ...body }) => {
      try {
        const result = await apiPost(
          `/applications/${id}/transfer`,
          body,
          include ? { include } : undefined
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_get_ai_score  GET /applications/{id}/ai-score
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_get_ai_score",
    "Get the structured AI score for an application, including per-criterion scores, justifications, and follow-up questions. Returns null score if the application has not been AI-scored.",
    {
      id: z
        .number()
        .describe("Application ID."),
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/applications/${id}/ai-score`);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_list_application_attachments  GET /applications/{id}/attachments
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_list_application_attachments",
    "List all file attachments linked to an application (resumes, cover letters, documents). Returns file metadata and download URLs.",
    {
      id: z
        .number()
        .describe("Application ID."),
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/applications/${id}/attachments`);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_upload_application_attachment  POST /applications/{id}/attachments
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_upload_application_attachment",
    "Upload a file attachment to an application. Provide the file as base64-encoded data. Commonly used for signed documents and interviewer artifacts.",
    {
      id: z
        .number()
        .describe("Application ID."),
      file: z
        .object({
          data: z.string().describe("Base64-encoded file content."),
          file_name: z.string().describe("Original file name."),
          mime_type: z.string().describe("MIME type (e.g. application/pdf)."),
        })
        .describe("File to upload."),
    },
    async ({ id, file }) => {
      try {
        const result = await apiPost(`/applications/${id}/attachments`, {
          file,
        });
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_list_application_evaluations  GET /applications/{id}/evaluation-forms
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_list_application_evaluations",
    "List all filled evaluation forms for an application. Each evaluation includes the evaluator, summary score (strong-yes to strong-no), and summary text.",
    {
      id: z
        .number()
        .describe("Application ID."),
    },
    async ({ id }) => {
      try {
        const result = await apiGet(
          `/applications/${id}/evaluation-forms`
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_create_interview  POST /applications/{id}/interviews
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_create_interview",
    "Schedule a new interview for an application. Provide start/end times as Unix timestamps and a list of interviewer user IDs. Location is resolved to an existing record or created automatically.",
    {
      id: z
        .number()
        .describe("Application ID."),
      start_time: z
        .number()
        .describe("Interview start time as Unix timestamp (seconds)."),
      end_time: z
        .number()
        .describe(
          "Interview end time as Unix timestamp (seconds, must be after start_time)."
        ),
      interviewer_ids: z
        .array(z.number())
        .describe("List of user IDs who will conduct the interview."),
      location: z
        .string()
        .optional()
        .describe(
          "Location string; resolved to existing record or created automatically."
        ),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated relations to embed: candidate, application, job."
        ),
    },
    async ({ id, include, ...body }) => {
      try {
        const result = await apiPost(
          `/applications/${id}/interviews`,
          body,
          include ? { include } : undefined
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_batch_move_applications  POST /applications/batch/move
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_batch_move_applications",
    "Move multiple applications to a pipeline stage in one request. Returns per-item results with partial success support. Max 100 application IDs per request.",
    {
      ids: z
        .array(z.number())
        .describe("Application IDs to move (max 100)."),
      stage_id: z.number().describe("Target pipeline stage ID."),
    },
    async (body) => {
      try {
        const result = await apiPost("/applications/batch/move", body);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // hires_batch_reject_applications  POST /applications/batch/reject
  // ---------------------------------------------------------------------------
  server.tool(
    "hires_batch_reject_applications",
    "Reject multiple applications in one request with an optional rejection reason. Returns per-item results with partial success support. Max 100 application IDs per request.",
    {
      ids: z
        .array(z.number())
        .describe("Application IDs to reject (max 100)."),
      rejection_reason_id: z
        .number()
        .optional()
        .describe("Optional rejection reason ID."),
    },
    async (body) => {
      try {
        const result = await apiPost("/applications/batch/reject", body);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );
}
