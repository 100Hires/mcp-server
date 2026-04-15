import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createCareerSiteClient, toolError } from "../client.js";

export function registerCareerSiteTools(server: McpServer): void {
  server.tool(
    "hires_list_career_jobs",
    "List publicly visible jobs for a company career site. Supports filtering by department, employment type, city, and country. Use to power a custom careers page.",
    {
      company_slug: z
        .string()
        .describe("Company slug identifying the career site"),
      department_id: z
        .number()
        .optional()
        .describe("Filter by department ID"),
      employment_type_id: z
        .number()
        .optional()
        .describe("Filter by employment type ID (e.g. Full-time, Part-time)"),
      city: z
        .string()
        .optional()
        .describe("Filter by job city (exact match)"),
      country: z
        .string()
        .optional()
        .describe("Filter by job country (exact match)"),
      page: z.number().optional().describe("Page number (default 1)"),
      size: z.number().optional().describe("Page size (default 25)"),
    },
    async (params) => {
      try {
        const client = createCareerSiteClient(params.company_slug);
        const query: Record<string, unknown> = {};
        if (params.department_id !== undefined)
          query.department_id = params.department_id;
        if (params.employment_type_id !== undefined)
          query.employment_type_id = params.employment_type_id;
        if (params.city !== undefined) query.city = params.city;
        if (params.country !== undefined) query.country = params.country;
        if (params.page !== undefined) query.page = params.page;
        if (params.size !== undefined) query.size = params.size;

        const result = await client.get("/career-site/jobs", query);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_get_career_job",
    "Get full details of a single public job by ID. Returns salary, education level, experience level, and other extended fields. Returns 404 for draft, archived, or internal jobs.",
    {
      company_slug: z
        .string()
        .describe("Company slug identifying the career site"),
      id: z.number().describe("Job ID"),
    },
    async (params) => {
      try {
        const client = createCareerSiteClient(params.company_slug);
        const result = await client.get(`/career-site/jobs/${params.id}`);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );

  server.tool(
    "hires_submit_career_application",
    "Submit a job application on behalf of a candidate. Creates a candidate record and triggers the career-site pipeline automation.",
    {
      company_slug: z
        .string()
        .describe("Company slug identifying the career site"),
      job_id: z.number().describe("Job ID to apply to"),
      first_name: z.string().describe("Applicant first name"),
      last_name: z.string().describe("Applicant last name"),
      email: z.string().describe("Applicant email address"),
      phone: z
        .string()
        .optional()
        .describe("Applicant phone number"),
      resume: z
        .object({
          data: z.string().describe("Base64-encoded file content"),
          file_name: z.string().describe("Resume file name (e.g. resume.pdf)"),
          mime_type: z.string().describe("Resume MIME type (e.g. application/pdf)"),
        })
        .optional()
        .describe("Resume file upload (base64 encoded)"),
      linkedin_url: z
        .string()
        .optional()
        .describe("Applicant LinkedIn profile URL"),
      source: z
        .string()
        .optional()
        .describe("Application source identifier"),
      answers: z
        .array(z.record(z.unknown()))
        .optional()
        .describe("Array of form answer objects"),
    },
    async (params) => {
      try {
        const client = createCareerSiteClient(params.company_slug);
        const body: Record<string, unknown> = {
          job_id: params.job_id,
          first_name: params.first_name,
          last_name: params.last_name,
          email: params.email,
        };
        if (params.phone !== undefined) body.phone = params.phone;
        if (params.resume !== undefined) body.resume = params.resume;
        if (params.linkedin_url !== undefined)
          body.linkedin_url = params.linkedin_url;
        if (params.source !== undefined) body.source = params.source;
        if (params.answers !== undefined) body.answers = params.answers;

        const result = await client.post("/career-site/applications", body);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (error) {
        return toolError((error as Error).message);
      }
    }
  );
}
