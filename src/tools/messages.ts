import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, toolResult, toolError } from "../client.js";

export function registerMessageTools(server: McpServer): void {
  // ── hires_list_messages ───────────────────────────────────────────────
  server.tool(
    "hires_list_messages",
    "List messages sent or scheduled from a specific mail account. Returns outbound messages only (sent and scheduled), not received. Useful for monitoring cold outreach campaigns — check pending queue, delivery history, and plan next sends.",
    {
      from_account_id: z
        .number()
        .int()
        .describe(
          "ID of the mail account (from `GET /companies/mail-accounts` or `GET /users/{user_id}/mail-accounts`)."
        ),
      status: z
        .enum(["scheduled", "sent", "all"])
        .optional()
        .describe(
          "Filter by message status: `scheduled` (pending send), `sent` (delivered), `all` (both). Default: `all`."
        ),
      date_from: z
        .number()
        .int()
        .optional()
        .describe(
          "Start of period (unix timestamp, seconds). Filters on scheduled/sent time."
        ),
      date_to: z
        .number()
        .int()
        .optional()
        .describe(
          "End of period (unix timestamp, seconds). Filters on scheduled/sent time."
        ),
      page: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("Page number (1-based). Default: 1."),
      size: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of items per page (1-100). Default: 20."),
    },
    async ({ from_account_id, status, date_from, date_to, page, size }) => {
      try {
        const params: Record<string, unknown> = { from_account_id };
        if (status !== undefined) params.status = status;
        if (date_from !== undefined) params.date_from = date_from;
        if (date_to !== undefined) params.date_to = date_to;
        if (page !== undefined) params.page = page;
        if (size !== undefined) params.size = size;

        const result = await apiGet("/messages", params);
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── hires_get_message ─────────────────────────────────────────────────
  server.tool(
    "hires_get_message",
    "Get a scheduled message by ID. Returns scheduler-backed message details including sender account, schedule timestamps, and cancelability.",
    {
      id: z.number().int().describe("Message ID."),
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/messages/${id}`);
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── hires_update_message ──────────────────────────────────────────────
  server.tool(
    "hires_update_message",
    "Fully update (replace) a scheduled message before send time. All required fields must be provided.",
    {
      id: z.number().int().describe("Message ID."),
      to: z
        .array(z.string())
        .describe("Primary recipient email addresses."),
      subject: z.string().describe("Email subject line."),
      body: z.string().describe("Email body as HTML."),
      from_account_id: z
        .number()
        .int()
        .nullable()
        .optional()
        .describe(
          "Sending mail account ID. If omitted, the API key owner's default mail account is used."
        ),
      cc: z
        .array(z.string())
        .optional()
        .describe("Carbon-copy recipient email addresses."),
      bcc: z
        .array(z.string())
        .optional()
        .describe("Blind carbon-copy recipient email addresses."),
      scheduled_at: z
        .number()
        .int()
        .nullable()
        .optional()
        .describe("Updated send time as a Unix timestamp in seconds."),
      reply_to_email_id: z
        .number()
        .int()
        .nullable()
        .optional()
        .describe("Optional mailbox message ID to reply to."),
      send_in_new_thread: z
        .boolean()
        .optional()
        .describe(
          "Whether to send the updated message as a new thread."
        ),
    },
    async ({
      id,
      to,
      subject,
      body,
      from_account_id,
      cc,
      bcc,
      scheduled_at,
      reply_to_email_id,
      send_in_new_thread,
    }) => {
      try {
        const data: Record<string, unknown> = { to, subject, body };
        if (from_account_id !== undefined) data.from_account_id = from_account_id;
        if (cc !== undefined) data.cc = cc;
        if (bcc !== undefined) data.bcc = bcc;
        if (scheduled_at !== undefined) data.scheduled_at = scheduled_at;
        if (reply_to_email_id !== undefined)
          data.reply_to_email_id = reply_to_email_id;
        if (send_in_new_thread !== undefined)
          data.send_in_new_thread = send_in_new_thread;

        const result = await apiPut(`/messages/${id}`, data);
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── hires_patch_message ───────────────────────────────────────────────
  server.tool(
    "hires_patch_message",
    "Partially update a scheduled message before send time. Only provided fields are changed.",
    {
      id: z.number().int().describe("Message ID."),
      to: z
        .array(z.string())
        .optional()
        .describe("Primary recipient email addresses."),
      subject: z.string().optional().describe("Email subject line."),
      body: z.string().optional().describe("Email body as HTML."),
      from_account_id: z
        .number()
        .int()
        .nullable()
        .optional()
        .describe(
          "Sending mail account ID. If omitted, the API key owner's default mail account is used."
        ),
      cc: z
        .array(z.string())
        .optional()
        .describe("Carbon-copy recipient email addresses."),
      bcc: z
        .array(z.string())
        .optional()
        .describe("Blind carbon-copy recipient email addresses."),
      scheduled_at: z
        .number()
        .int()
        .nullable()
        .optional()
        .describe("Updated send time as a Unix timestamp in seconds."),
      reply_to_email_id: z
        .number()
        .int()
        .nullable()
        .optional()
        .describe("Optional mailbox message ID to reply to."),
      send_in_new_thread: z
        .boolean()
        .optional()
        .describe(
          "Whether to send the updated message as a new thread."
        ),
    },
    async ({
      id,
      to,
      subject,
      body,
      from_account_id,
      cc,
      bcc,
      scheduled_at,
      reply_to_email_id,
      send_in_new_thread,
    }) => {
      try {
        const data: Record<string, unknown> = {};
        if (to !== undefined) data.to = to;
        if (subject !== undefined) data.subject = subject;
        if (body !== undefined) data.body = body;
        if (from_account_id !== undefined) data.from_account_id = from_account_id;
        if (cc !== undefined) data.cc = cc;
        if (bcc !== undefined) data.bcc = bcc;
        if (scheduled_at !== undefined) data.scheduled_at = scheduled_at;
        if (reply_to_email_id !== undefined)
          data.reply_to_email_id = reply_to_email_id;
        if (send_in_new_thread !== undefined)
          data.send_in_new_thread = send_in_new_thread;

        const result = await apiPatch(`/messages/${id}`, data);
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── hires_delete_message ──────────────────────────────────────────────
  server.tool(
    "hires_delete_message",
    "Cancel a scheduled message before it is processed by the mailbox scheduler.",
    {
      id: z.number().int().describe("Message ID."),
    },
    async ({ id }) => {
      try {
        const result = await apiDelete(`/messages/${id}`);
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── hires_batch_create_messages ───────────────────────────────────────
  server.tool(
    "hires_batch_create_messages",
    "Create up to 100 scheduled messages in one request. Each item specifies its own candidate_id and message payload. Items are processed independently -- one failure does not stop others. Per-candidate RBAC is enforced for each item.",
    {
      messages: z
        .array(
          z.object({
            candidate_id: z
              .number()
              .int()
              .describe("Target candidate ID for this message."),
            to: z
              .array(z.string())
              .describe("Primary recipient email addresses."),
            subject: z.string().describe("Email subject line."),
            body: z.string().describe("Email body as HTML."),
            from_account_id: z
              .number()
              .int()
              .nullable()
              .optional()
              .describe(
                "Sending mail account ID. If omitted, the API key owner's default mail account is used."
              ),
            cc: z
              .array(z.string())
              .optional()
              .describe("Carbon-copy recipient email addresses."),
            bcc: z
              .array(z.string())
              .optional()
              .describe("Blind carbon-copy recipient email addresses."),
            scheduled_at: z
              .number()
              .int()
              .nullable()
              .optional()
              .describe(
                "Unix timestamp (seconds). If omitted, defaults to created time plus 900 seconds."
              ),
            application_id: z
              .number()
              .int()
              .nullable()
              .optional()
              .describe("Optional application ID linked to this message."),
            reply_to_email_id: z
              .number()
              .int()
              .nullable()
              .optional()
              .describe("Optional mailbox message ID to reply to."),
            send_in_new_thread: z
              .boolean()
              .optional()
              .describe(
                "Whether to send the message as a new thread instead of replying in an existing thread."
              ),
          })
        )
        .max(100)
        .describe("Array of message payloads to create (max 100)."),
    },
    async ({ messages }) => {
      try {
        const result = await apiPost("/messages/batch/create", { messages });
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );
}
