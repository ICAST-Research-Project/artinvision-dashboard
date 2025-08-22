import { fetch as undiciFetch } from "undici";

export const TEXT_EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dims

export function asVectorLiteral(vec: number[]) {
  return `'[${vec.join(",")}]'`;
}

export async function embedText(text: string): Promise<number[]> {
  const input = text.trim().slice(0, 4000);
  const res = await undiciFetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({ model: TEXT_EMBEDDING_MODEL, input }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI embeddings error ${res.status}: ${errText}`);
  }

  const json = (await res.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return json.data[0].embedding;
}
