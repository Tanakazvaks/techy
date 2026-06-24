import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic() {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

// Make a single completion call. Returns the text content.
export async function complete(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1024
): Promise<string> {
  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return block.text;
}
