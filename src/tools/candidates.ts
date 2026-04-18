import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete, toolResult, toolError } from "../client.js";

/** Candidate ID or alias — the API accepts both numeric IDs and string aliases. */
const CandidateId = z
  .union([z.string(), z.number()])
  .describe("Candidate ID (integer) or alias (string).");

export function registerCandidateTools(server: McpServer): void {
  // ── List candidates ────────────────────────────────────────────────
  server.tool(
    "hires_list_candidates",
    "List candidates with optional filters. Supports filtering by job, stage, email, name, LinkedIn, and date ranges. Returns paginated results.",
    {
      company_id: z.number().optional().describe("Filter by company ID. Required only when the API key has access to multiple companies."),
      job_id: z.number().optional().describe("Filter candidates by job ID."),
      stage_id: z.number().optional().describe("Filter candidates by pipeline stage ID. Best used together with job_id."),
      email: z.string().optional().describe("Exact candidate email filter."),
      q: z.string().optional().describe("Plain-text search by name or email. Supports partial matches."),
      full_name: z.string().optional().describe("Candidate full-name filter."),
      linkedin: z.string().optional().describe("Search by LinkedIn profile URL or alias (e.g. 'johndoe' or full URL)."),
      created_after: z.number().optional().describe("Return only candidates created after this Unix timestamp (seconds)."),
      updated_after: z.number().optional().describe("Return only candidates updated after this Unix timestamp (seconds). Useful for incremental sync."),
      include: z.string().optional().describe("Comma-separated list of optional related data to include in the response."),
      page: z.number().optional().describe("Page number (1-based)."),
      size: z.number().optional().describe("Number of items per page."),
    },
    async (params) => {
      try {
        const result = await apiGet("/candidates", params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Create candidate ───────────────────────────────────────────────
  server.tool(
    "hires_create_candidate",
    "Create a new candidate profile. Optionally link to a job/stage and attach a CV. Used for imports, inbound forms, and enrichment workflows.",
    {
      company_id: z.number().optional().describe("Target company ID. Required only when the API key has access to multiple companies."),
      first_name: z.string().optional().describe("Candidate first name."),
      last_name: z.string().optional().describe("Candidate last name."),
      email: z.string().optional().describe("Candidate email address. Used for deduplication."),
      phone: z.string().optional().describe("Candidate phone number."),
      profile: z
        .record(z.string(), z.string())
        .optional()
        .describe('Key-value map of profile field answers. Keys can be question text or question_id. Example: {"Current job title": "Senior Engineer"}.'),
      job_id: z.number().optional().describe("Job ID to create an application for this candidate."),
      stage_id: z.number().optional().describe("Pipeline stage ID for the initial application. Requires job_id."),
      cv: z
        .object({
          data: z.string().describe("Base64-encoded file content."),
          file_name: z.string().describe("Original file name."),
          mime_type: z.string().describe("MIME type (e.g. application/pdf)."),
        })
        .optional()
        .describe("CV/resume file to attach (base64 payload)."),
    },
    async (params) => {
      try {
        const result = await apiPost("/candidates", params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Get candidate ──────────────────────────────────────────────────
  server.tool(
    "hires_get_candidate",
    "Get full candidate data including application summaries by candidate ID or alias.",
    {
      id: CandidateId,
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/candidates/${id}`);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Update candidate ───────────────────────────────────────────────
  server.tool(
    "hires_update_candidate",
    "Update candidate fields, profile answers, and optional CV. Used for bi-directional sync from ATS, CRM, sourcing, or enrichment tools.",
    {
      id: CandidateId,
      first_name: z.string().optional().describe("Candidate first name."),
      last_name: z.string().optional().describe("Candidate last name."),
      email: z.string().optional().describe("Candidate email address."),
      phone: z.string().optional().describe("Candidate phone number."),
      profile: z
        .record(z.string(), z.string())
        .optional()
        .describe('Key-value map of profile field answers. Keys can be question text or question_id.'),
      job_id: z.number().optional().describe("Job ID to create a new application for this candidate."),
      stage_id: z.number().optional().describe("Pipeline stage ID for the application. Requires job_id."),
      cv: z
        .object({
          data: z.string().describe("Base64-encoded file content."),
          file_name: z.string().describe("Original file name."),
          mime_type: z.string().describe("MIME type (e.g. application/pdf)."),
        })
        .optional()
        .describe("CV/resume file to attach (base64 payload)."),
    },
    async ({ id, ...body }) => {
      try {
        const result = await apiPut(`/candidates/${id}`, body);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Delete candidate ───────────────────────────────────────────────
  server.tool(
    "hires_delete_candidate",
    "Permanently delete a candidate by ID or alias.",
    {
      id: CandidateId,
    },
    async ({ id }) => {
      try {
        const result = await apiDelete(`/candidates/${id}`);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── List candidate tags ────────────────────────────────────────────
  server.tool(
    "hires_list_candidate_tags",
    "List all tags assigned to a candidate. Useful for segmentation and audience-based automations.",
    {
      id: CandidateId,
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/candidates/${id}/tags`);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Add candidate tags ─────────────────────────────────────────────
  server.tool(
    "hires_add_candidate_tags",
    "Add one or more tags to a candidate. Used for campaign tagging, qualification labels, and source attribution.",
    {
      id: CandidateId,
      tags: z.array(z.string()).describe("Array of tag strings to add."),
    },
    async ({ id, tags }) => {
      try {
        const result = await apiPost(`/candidates/${id}/tags`, { tags });
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Remove candidate tag ───────────────────────────────────────────
  server.tool(
    "hires_remove_candidate_tag",
    "Remove a specific tag from a candidate.",
    {
      id: CandidateId,
      tag: z.string().describe("The tag string to remove."),
    },
    async ({ id, tag }) => {
      try {
        const result = await apiDelete(
          `/candidates/${id}/tags/${encodeURIComponent(String(tag))}`
        );
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Batch add tags ─────────────────────────────────────────────────
  server.tool(
    "hires_batch_add_tags",
    "Add tags to multiple candidates in one request (max 100). Returns per-item results with partial success support.",
    {
      ids: z.array(z.number()).describe("Candidate IDs to tag (max 100)."),
      tags: z.array(z.string()).describe("Tag names to attach."),
    },
    async (params) => {
      try {
        const result = await apiPost("/candidates/batch/tags", params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Batch remove tags ──────────────────────────────────────────────
  server.tool(
    "hires_batch_remove_tags",
    "Remove tags from multiple candidates in one request (max 100). Returns per-item results with partial success support.",
    {
      ids: z.array(z.number()).describe("Candidate IDs to remove tags from (max 100)."),
      tags: z.array(z.string()).describe("Tag names to remove."),
    },
    async (params) => {
      try {
        const result = await apiDelete("/candidates/batch/tags", undefined, params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── List candidate files ───────────────────────────────────────────
  server.tool(
    "hires_list_candidate_files",
    "List all files attached to a candidate (resumes and other documents). Each entry has uuid, absolute download url (use Bearer auth), relative_time, file metadata (orig_file_name, file_ext, file_type/MIME, readable_size), and type (resume/other).",
    {
      id: CandidateId,
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/candidates/${id}/files`);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Upload candidate file ──────────────────────────────────────────
  server.tool(
    "hires_upload_candidate_file",
    "Upload a file for a candidate using a base64 payload. Used for resume ingestion, portfolio uploads, and document attachment.",
    {
      id: CandidateId,
      file: z
        .object({
          data: z.string().describe("Base64-encoded file content."),
          file_name: z.string().describe("Original file name."),
          mime_type: z.string().describe("MIME type (e.g. application/pdf)."),
        })
        .describe("File to upload (base64 payload)."),
    },
    async ({ id, file }) => {
      try {
        const result = await apiPost(`/candidates/${id}/files`, { file });
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Get candidate resume ───────────────────────────────────────────
  server.tool(
    "hires_get_candidate_resume",
    "Get the primary resume for a candidate. Returns uuid, absolute download url (use Bearer auth), relative_time, file metadata, type. Use include='text_content' to also get the parsed plain-text content in a `text` field without downloading the file.",
    {
      id: CandidateId,
      include: z.string().optional().describe("Comma-separated optional fields. Use 'text_content' to add a `text` field with parsed plain-text resume content."),
    },
    async ({ id, include }) => {
      try {
        const params: Record<string, unknown> = {};
        if (include) params.include = include;
        const result = await apiGet(`/candidates/${id}/resume`, params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── List candidate activities ──────────────────────────────────────
  server.tool(
    "hires_list_candidate_activities",
    "List timeline activities for a candidate (comments, stage moves, AI responses, etc.). Supports filtering by event type.",
    {
      id: CandidateId,
      page: z.number().optional().describe("Page number (1-based)."),
      event_type: z
        .string()
        .optional()
        .describe(
          "Comma-separated event types to filter. Supported: comment, copilot_response, stage_moved, automation_action_triggered, assign_job, enrichment, call, validate_emails, profile_mutation, qualification, assign_tags, assign_sources, candidate_rate."
        ),
    },
    async ({ id, page, event_type }) => {
      try {
        const params: Record<string, unknown> = {};
        if (page !== undefined) params.page = page;
        if (event_type) params.event_type = event_type;
        const result = await apiGet(`/candidates/${id}/activities`, params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Disqualify candidate ───────────────────────────────────────────
  server.tool(
    "hires_disqualify_candidate",
    "Disqualify a candidate from all active applications. Optionally provide rejection reason IDs. Returns affected application IDs.",
    {
      id: CandidateId,
      reasons: z
        .array(z.union([z.number(), z.string()]))
        .optional()
        .describe("Array of rejection reason IDs from GET /taxonomy/rejection-reasons."),
    },
    async ({ id, reasons }) => {
      try {
        const body = reasons ? { reasons } : undefined;
        const result = await apiPost(`/candidates/${id}/disqualify`, body);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── List candidate interviews ──────────────────────────────────────
  server.tool(
    "hires_list_candidate_interviews",
    "List all interviews for a candidate across all applications. Useful for timeline views and scheduling conflict detection.",
    {
      id: CandidateId,
      page: z.number().optional().describe("Page number (1-based)."),
      size: z.number().optional().describe("Number of items per page."),
    },
    async ({ id, page, size }) => {
      try {
        const params: Record<string, unknown> = {};
        if (page !== undefined) params.page = page;
        if (size !== undefined) params.size = size;
        const result = await apiGet(`/candidates/${id}/interviews`, params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── List candidate messages ────────────────────────────────────────
  server.tool(
    "hires_list_candidate_messages",
    "List email and messaging history for a candidate. Use is_scheduled=1 to filter only pending scheduled messages.",
    {
      id: CandidateId,
      page: z.number().optional().describe("Page number (1-based)."),
      size: z.number().optional().describe("Number of items per page."),
      is_scheduled: z
        .number()
        .optional()
        .describe("Set to 1 to return only scheduled (not yet sent) messages."),
    },
    async ({ id, page, size, is_scheduled }) => {
      try {
        const params: Record<string, unknown> = {};
        if (page !== undefined) params.page = page;
        if (size !== undefined) params.size = size;
        if (is_scheduled !== undefined) params.is_scheduled = is_scheduled;
        const result = await apiGet(`/candidates/${id}/messages`, params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );

  // ── Send candidate message ─────────────────────────────────────────
  server.tool(
    "hires_send_candidate_message",
    "Schedule an email message to a candidate. If scheduled_at is omitted, the message is scheduled for 15 minutes after creation.",
    {
      id: CandidateId,
      to: z.array(z.string()).describe("Primary recipient email addresses."),
      subject: z.string().describe("Email subject line."),
      body: z.string().describe("Email body as HTML."),
      from_account_id: z
        .number()
        .optional()
        .describe("Sending mail account ID. If omitted, uses the API key owner's default mail account."),
      cc: z.array(z.string()).optional().describe("Carbon-copy recipient email addresses."),
      bcc: z.array(z.string()).optional().describe("Blind carbon-copy recipient email addresses."),
      scheduled_at: z
        .number()
        .optional()
        .describe("Unix timestamp (seconds) for when to send. Defaults to 15 minutes after creation."),
      application_id: z.number().optional().describe("Optional application ID to link this message to."),
      reply_to_email_id: z.number().optional().describe("Optional mailbox message ID to reply to."),
      send_in_new_thread: z
        .boolean()
        .optional()
        .describe("Send as a new email thread instead of replying in an existing one."),
    },
    async ({ id, ...emailData }) => {
      try {
        const result = await apiPost(`/candidates/${id}/messages`, emailData);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );
}
