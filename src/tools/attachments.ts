import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGetBinary, apiPost, toolResult, toolError } from "../client.js";

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function parseFilename(contentDisposition: string): string | null {
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function registerAttachmentTools(server: McpServer): void {
  server.tool(
    "hires_download_attachment",
    "Download an attachment (resume, candidate file, application file, mail attachment, call recording). Pass the absolute URL returned by another endpoint (e.g. `message.attachments[].url`, `cv.url`, `resume.url`) — it MUST belong to the configured 100Hires API host; other hosts are rejected to avoid leaking the Bearer token. Returns `{file_name, mime_type, size, data}` where `data` is base64-encoded bytes. Files larger than 25 MB are rejected up-front (Content-Length check / streaming abort) without being loaded into memory.",
    {
      url: z
        .string()
        .url()
        .describe(
          "Absolute attachment URL returned by another API response (e.g. https://api.100hires.com/v2/attachments/mail_attachment/<uuid>/<file_name>). Must match the API host."
        ),
    },
    async ({ url }) => {
      try {
        const { data, contentType, contentDisposition } = await apiGetBinary(url, MAX_SIZE_BYTES);
        return toolResult(
          JSON.stringify(
            {
              file_name: parseFilename(contentDisposition),
              mime_type: contentType,
              size: data.length,
              data: data.toString("base64"),
            },
            null,
            2
          )
        );
      } catch (error: any) {
        return toolError(error.message || String(error));
      }
    }
  );

  server.tool(
    "hires_upload_attachment",
    "Upload a file and create an attachment. Supported categories: `voicemail` (wav/mp3, max 20 MB, no object_id — returned `uuid` is usable as `attachment_uuid` in nurture voicemail steps); `candidate` (candidate ID); `application` (application ID); `candidate_comment` (comment ID); `job_note` (job-note ID); `company_favicon`/`company_header`/`company_link_preview` (company ID). Object ownership is strictly verified against the authenticated API key's company. Returns `{uuid, url, file, relative_time}`.",
    {
      category: z
        .enum([
          "voicemail",
          "candidate",
          "application",
          "candidate_comment",
          "job_note",
          "company_favicon",
          "company_header",
          "company_link_preview",
        ])
        .describe("Attachment category. Determines allowed extensions and object_id semantics."),
      company_id: z
        .number()
        .optional()
        .describe("Target company ID. Needed for partner API keys managing multiple client companies. Omitted → defaults to the authenticated company. The object_id must belong to this company (strict match)."),
      object_id: z
        .number()
        .optional()
        .describe("Target object ID (candidate/application/comment/job-note/company, per category). Omit for `voicemail`."),
      file: z
        .object({
          data: z.string().describe("Base64-encoded file bytes."),
          file_name: z.string().describe("Original file name (with extension, e.g. `greeting.mp3`)."),
          mime_type: z.string().describe("MIME type (e.g. `audio/mpeg`, `application/pdf`)."),
        })
        .describe("File payload."),
    },
    async (params) => {
      try {
        const result = await apiPost("/attachments", params);
        return toolResult(result);
      } catch (error: any) {
        return toolError(error.message);
      }
    }
  );
}
