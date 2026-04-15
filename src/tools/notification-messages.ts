import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPut, apiDelete, toolResult, toolError } from "../client.js";

export function registerNotificationMessageTools(server: McpServer): void {
  // ── hires_get_notification_message ──────────────────────────────────
  server.tool(
    "hires_get_notification_message",
    "Get a notification email message (e.g. rejection email) by ID. Returns subject, body, sender, recipient, and schedule metadata. Use candidate messages list to discover notification message IDs.",
    {
      id: z.number().int().describe("Notification email message ID."),
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/notification-messages/${id}`);
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── hires_update_notification_message ───────────────────────────────
  server.tool(
    "hires_update_notification_message",
    "Update a scheduled notification email before it is sent. Change subject, body, and optionally reschedule the send time. Only scheduled (not yet sent) messages can be updated.",
    {
      id: z.number().int().describe("Notification email message ID."),
      subject: z.string().describe("Email subject line."),
      body: z.string().describe("Email body as HTML."),
      scheduled_at: z
        .number()
        .int()
        .nullable()
        .optional()
        .describe(
          "Unix timestamp (seconds) to reschedule send time. If omitted, the existing schedule is preserved."
        ),
    },
    async ({ id, subject, body, scheduled_at }) => {
      try {
        const data: Record<string, unknown> = { subject, body };
        if (scheduled_at !== undefined) data.scheduled_at = scheduled_at;

        const result = await apiPut(`/notification-messages/${id}`, data);
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── hires_delete_notification_message ───────────────────────────────
  server.tool(
    "hires_delete_notification_message",
    "Cancel a scheduled notification email before it is sent. Already sent messages cannot be canceled.",
    {
      id: z.number().int().describe("Notification email message ID."),
    },
    async ({ id }) => {
      try {
        const result = await apiDelete(`/notification-messages/${id}`);
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );

  // ── hires_cancel_all_notification_messages ──────────────────────────
  server.tool(
    "hires_cancel_all_notification_messages",
    "Cancel all scheduled notification emails for a candidate. Already sent notifications are not affected. Returns success even if no scheduled notifications exist.",
    {
      candidate_id: z
        .union([z.number().int(), z.string()])
        .describe("Candidate ID (numeric) or alias."),
    },
    async ({ candidate_id }) => {
      try {
        const result = await apiDelete(
          `/candidates/${candidate_id}/notification-messages`
        );
        return toolResult(result);
      } catch (error: unknown) {
        return toolError((error as Error).message);
      }
    }
  );
}
