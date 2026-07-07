import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Server-only helper that connects the AI SDK to the Lovable AI Gateway.
 * Read LOVABLE_API_KEY inside the server function handler and pass it here.
 */
export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: false,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}
