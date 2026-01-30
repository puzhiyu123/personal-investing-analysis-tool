interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

interface PerplexityOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function searchPerplexity(
  query: string,
  options: PerplexityOptions = {}
): Promise<{ content: string; citations: string[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY environment variable is not set");
  }

  const {
    model = "sonar-pro",
    maxTokens = 8192,
    temperature = 0.1,
  } = options;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a financial research assistant. Provide detailed, accurate, and current financial data with specific numbers, dates, and sources. Be comprehensive but focused.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Perplexity API error (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as PerplexityResponse;

  return {
    content: data.choices[0]?.message?.content || "",
    citations: data.citations || [],
  };
}

export async function searchPerplexityBatch(
  queries: string[],
  options: PerplexityOptions & { concurrency?: number } = {}
): Promise<Array<{ query: string; content: string; citations: string[] }>> {
  const { concurrency = 3, ...perplexityOptions } = options;

  const results: Array<{
    query: string;
    content: string;
    citations: string[];
  }> = [];

  // Process in batches respecting concurrency limit
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (query) => {
        try {
          const result = await searchPerplexity(query, perplexityOptions);
          return { query, ...result };
        } catch (error) {
          console.error(`Perplexity query failed: ${query}`, error);
          return { query, content: "", citations: [] };
        }
      })
    );
    results.push(...batchResults);
  }

  return results;
}
