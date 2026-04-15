import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiGet, toolResult, toolError } from "../client.js";

export function registerEvaluationTools(server: McpServer): void {
  server.tool(
    "hires_get_evaluation",
    "Get a filled evaluation form with all answers. Returns evaluator info, summary score, summary text, and individual question answers. Use for detailed review of evaluator feedback on a candidate application.",
    {
      id: z.number().describe("Evaluation form ID"),
    },
    async ({ id }) => {
      const result = await apiGet(`/evaluation-forms/${id}`);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );
}
