#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initClient } from "./client.js";

import { registerCandidateTools } from "./tools/candidates.js";
import { registerApplicationTools } from "./tools/applications.js";
import { registerJobTools } from "./tools/jobs.js";
import { registerMessageTools } from "./tools/messages.js";
import { registerNotificationMessageTools } from "./tools/notification-messages.js";
import { registerInterviewTools } from "./tools/interviews.js";
import { registerNoteTools } from "./tools/notes.js";
import { registerEvaluationTools } from "./tools/evaluations.js";
import { registerFormTools } from "./tools/forms.js";
import { registerEmailTemplateTools } from "./tools/email-templates.js";
import { registerNurtureCampaignTools } from "./tools/nurture-campaigns.js";
import { registerUserTools } from "./tools/users.js";
import { registerCompanyTools } from "./tools/companies.js";
import { registerTaxonomyTools } from "./tools/taxonomy.js";
import { registerFeedbackTools } from "./tools/feedback.js";
import { registerCareerSiteTools } from "./tools/career-site.js";

const API_KEY = process.env.API_KEY;

const server = new McpServer({
  name: "100hires-mcp-server",
  version: "1.0.0",
});

if (API_KEY) {
  initClient(API_KEY);
  registerCandidateTools(server);
  registerApplicationTools(server);
  registerJobTools(server);
  registerMessageTools(server);
  registerNotificationMessageTools(server);
  registerInterviewTools(server);
  registerNoteTools(server);
  registerEvaluationTools(server);
  registerFormTools(server);
  registerEmailTemplateTools(server);
  registerNurtureCampaignTools(server);
  registerUserTools(server);
  registerCompanyTools(server);
  registerTaxonomyTools(server);
  registerFeedbackTools(server);
}

// Career-site tools use X-Company-Slug header, no API key needed
registerCareerSiteTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
