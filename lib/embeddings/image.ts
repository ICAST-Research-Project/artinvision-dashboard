import { fetch as undiciFetch } from "undici";
import { pipeline, RawImage } from "@xenova/transformers";

export const IMAGE_EMBEDDING_MODEL = "clip-vit-base-patch32"; // 512 dims

export async function embedImageFromUrl(url: string): Promise<number[]> {
  const provider = (
    process.env.IMAGE_EMBEDDING_PROVIDER || "fastapi"
  ).toLowerCase();
  const fastapiUrl = process.env.IMAGE_EMBEDDING_FASTAPI_URL;

  // FastAPI
  if (provider === "fastapi" && fastapiUrl) {
    const res = await undiciFetch(fastapiUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image_url: url }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`FastAPI image embed failed: ${res.status} ${txt}`);
    }
    const body = (await res.json()) as { embedding: number[] };
    return body.embedding;
  }

  // Node fallback (transformers.js)
  const rawImage = await RawImage.fromURL(url);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fe: any = await pipeline(
    "image-feature-extraction",
    "Xenova/clip-vit-base-patch32",
    { quantized: true }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out = await fe(rawImage as any, { pooling: "mean", normalize: true });
  return Array.from(out.data as Float32Array);
}
