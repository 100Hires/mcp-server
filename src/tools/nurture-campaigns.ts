import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, apiPost, apiPut, apiDelete, toolResult, toolError } from "../client.js";

// --- Step input schemas (discriminated by `type`) ---

const SenderSchema = z.object({
  type: z.string().describe('Sender type: "account" or "user"'),
  id: z.number().describe("Sender ID"),
});

const StepBaseFields = {
  id: z
    .number()
    .optional()
    .describe("Step ID (required when updating an existing step)"),
  delay_days: z.number().min(0).describe("Days to wait before executing this step"),
  send_condition: z
    .enum(["if_no_reply", "if_no_reply_but_opened"])
    .describe("Condition for sending this step"),
  is_deleted: z
    .boolean()
    .optional()
    .describe("Set true to remove this step during update"),
};

const EmailStepSchema = z.object({
  ...StepBaseFields,
  type: z.literal("email"),
  sender: SenderSchema.describe("Email sender"),
  template_id: z.number().describe("Email template ID"),
  is_new_thread: z
    .boolean()
    .optional()
    .describe("Send as new email thread"),
  schedule_id: z
    .number()
    .optional()
    .describe("Sending schedule ID"),
  is_send_by_carousel: z
    .boolean()
    .optional()
    .describe("Send by carousel rotation"),
});

const SmsStepSchema = z.object({
  ...StepBaseFields,
  type: z.literal("sms"),
  sender_user_id: z.number().describe("Sender user ID"),
  template_id: z.number().describe("SMS template ID"),
  schedule_id: z
    .number()
    .optional()
    .describe("Sending schedule ID"),
  is_send_by_carousel: z
    .boolean()
    .optional()
    .describe("Send by carousel rotation"),
});

const VoicemailStepSchema = z.object({
  ...StepBaseFields,
  type: z.literal("voicemail"),
  attachment_id: z.number().describe("Voicemail audio file ID"),
  schedule_id: z
    .number()
    .optional()
    .describe("Sending schedule ID"),
});

const MoveToNextStageStepSchema = z.object({
  ...StepBaseFields,
  type: z.literal("move_to_next_stage"),
  stage_id: z.number().describe("Target pipeline stage ID"),
});

const AssignTagStepSchema = z.object({
  ...StepBaseFields,
  type: z.literal("assign_tag"),
  tag_id: z.number().describe("Tag ID to assign"),
});

const AssignTaskStepSchema = z.object({
  ...StepBaseFields,
  type: z.literal("assign_task"),
  task_template_id: z.number().describe("Task template ID"),
  assignees: z.array(z.number()).describe("Assignee user IDs"),
  due_in_interval: z
    .string()
    .optional()
    .describe('Due date interval, e.g. "P3D"'),
  priority: z.number().optional().describe("Task priority"),
});

const StepInputSchema = z.discriminatedUnion("type", [
  EmailStepSchema,
  SmsStepSchema,
  VoicemailStepSchema,
  MoveToNextStageStepSchema,
  AssignTagStepSchema,
  AssignTaskStepSchema,
]);

// --- Tool registration ---

export function registerNurtureCampaignTools(server: McpServer): void {
  // LIST
  server.tool(
    "hires_list_nurture_campaigns",
    "List nurture campaigns with pagination. Returns campaign summaries including steps.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (optional if API key is scoped to one company)"),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {};
        if (params.company_id !== undefined) query.company_id = params.company_id;
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await apiGet("/nurture-campaigns", query);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // CREATE
  server.tool(
    "hires_create_nurture_campaign",
    "Create a nurture campaign with steps. Steps are executed sequentially; each step has a type (email, sms, voicemail, move_to_next_stage, assign_tag, assign_task) with type-specific fields. Optionally bind to a workflow stage.",
    {
      company_id: z
        .number()
        .optional()
        .describe("Target company ID (optional if API key is scoped to one company)"),
      title: z.string().describe("Campaign name"),
      workflow_id: z
        .number()
        .optional()
        .describe("Workflow ID to bind the campaign to"),
      stage_id: z
        .number()
        .optional()
        .describe("Stage ID that triggers the campaign"),
      delay_time: z
        .number()
        .optional()
        .describe("Delay time in seconds"),
      relative_days: z
        .number()
        .optional()
        .describe("Relative days for schedule"),
      relative_time: z
        .number()
        .optional()
        .describe("Relative time for schedule (seconds from midnight)"),
      timezone: z
        .string()
        .optional()
        .describe('IANA timezone, e.g. "America/New_York"'),
      send_to_all: z
        .boolean()
        .optional()
        .describe("Send to all candidates or only new ones (default false)"),
      response_move_to_stage_id: z
        .number()
        .optional()
        .describe("Stage to move candidate to when they reply"),
      steps: z
        .array(StepInputSchema)
        .describe("Campaign steps (at least one required)"),
    },
    async (params) => {
      try {
        const result = await apiPost("/nurture-campaigns", params);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // GET
  server.tool(
    "hires_get_nurture_campaign",
    "Get a single nurture campaign by ID with all steps and configuration details.",
    {
      id: z.number().describe("Nurture campaign ID"),
    },
    async ({ id }) => {
      try {
        const result = await apiGet(`/nurture-campaigns/${id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // UPDATE
  server.tool(
    "hires_update_nurture_campaign",
    "Update an existing nurture campaign. Pass all steps -- mark removed steps with is_deleted=true. Existing steps must include their id.",
    {
      id: z.number().describe("Nurture campaign ID"),
      title: z.string().describe("Campaign name"),
      workflow_id: z
        .number()
        .optional()
        .describe("Workflow ID this campaign is associated with"),
      stage_id: z
        .number()
        .optional()
        .describe("Pipeline stage ID that triggers the campaign"),
      delay_time: z
        .number()
        .optional()
        .describe("Delay in minutes before the first step"),
      relative_days: z
        .number()
        .optional()
        .describe("Number of days offset for scheduling"),
      relative_time: z
        .number()
        .optional()
        .describe("Time of day for scheduled sends"),
      timezone: z
        .string()
        .optional()
        .describe('Timezone for scheduled sends, e.g. "America/New_York"'),
      send_to_all: z
        .boolean()
        .optional()
        .describe("Whether to send to all candidates or only new ones"),
      response_move_to_stage_id: z
        .number()
        .optional()
        .describe("Stage ID to move candidates to when they respond"),
      steps: z
        .array(StepInputSchema)
        .describe("All steps -- mark removed steps with is_deleted=true"),
    },
    async (params) => {
      try {
        const { id, ...body } = params;
        const result = await apiPut(`/nurture-campaigns/${id}`, body);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  // DELETE
  server.tool(
    "hires_delete_nurture_campaign",
    "Delete (soft-delete) a nurture campaign. Active campaign executions will be stopped.",
    {
      id: z.number().describe("Nurture campaign ID"),
    },
    async ({ id }) => {
      try {
        const result = await apiDelete(`/nurture-campaigns/${id}`);
        return toolResult(result);
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );
}
