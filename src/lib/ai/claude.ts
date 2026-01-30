import Anthropic from "@anthropic-ai/sdk";

let claudeClient: Anthropic | null = null;

function getClaude(): Anthropic {
  if (!claudeClient) {
    claudeClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return claudeClient;
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeOptions {
  maxTokens?: number;
  temperature?: number;
  system?: string;
  model?: string;
}

export async function generateClaudeCompletion(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): Promise<string> {
  const {
    maxTokens = 16384,
    temperature = 0.7,
    system,
    model = "claude-sonnet-4-5-20250929",
  } = options;

  const response = await getClaude().messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages,
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error(
      `Response truncated: exceeded ${maxTokens} max_tokens. Increase maxTokens or simplify the prompt.`
    );
  }

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response");
  }

  return textContent.text;
}

export async function generateClaudeJSON<T>(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): Promise<T> {
  const response = await generateClaudeCompletion(messages, {
    ...options,
    temperature: options.temperature ?? 0.3,
  });

  let jsonString = response;
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1].trim();
  } else {
    const openFence = response.match(/^```(?:json)?\s*/);
    if (openFence) {
      jsonString = response.slice(openFence[0].length).trim();
    }
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", response);
    throw new Error(`Failed to parse Claude response as JSON: ${error}`);
  }
}

export { getClaude };
