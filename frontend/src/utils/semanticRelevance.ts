/**
 * Optional, browser-only semantic relevance check using a small sentence
 * embedding model. This is the one genuinely AI-powered piece in the
 * review pipeline - everything else in resumeBulletReviewer.ts is plain
 * string/regex rules. See docs/product-plan.md, "AI Integration
 * Principles".
 *
 * Zero cost by design:
 * - No npm dependency and no build-time download - the model runtime is
 *   loaded from a public CDN via a dynamic import at call time, so it
 *   only ever downloads in the end user's own browser, once, and is
 *   cached there afterwards.
 * - No server and no API key - inference runs entirely on the user's own
 *   device (WebGPU if available, otherwise WASM on CPU).
 * - No paid service of any kind is involved anywhere in this file.
 *
 * This is a progressive enhancement, not a dependency: if the model
 * fails to load (offline, blocked network, unsupported browser, slow
 * connection), callers get { available: false } and should keep using
 * the existing keyword-overlap check in resumeBulletReviewer.ts. Nothing
 * else in the app depends on this succeeding, and it never throws.
 */

type EmbeddingOutput = { data: ArrayLike<number> };

type EmbeddingPipeline = (
  text: string,
  options?: { pooling?: "mean"; normalize?: boolean },
) => Promise<EmbeddingOutput>;

type PipelineFactory = (
  task: "feature-extraction",
  model: string,
) => Promise<EmbeddingPipeline>;

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";

// Pinned to the @huggingface/transformers major version 3 line via
// jsdelivr's npm CDN. Loaded as a runtime ES module import, not an npm
// dependency of this project.
const TRANSFORMERS_CDN_URL =
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3";

// Longer text than this is truncated before embedding, purely to keep
// in-browser inference fast on a full job description paste. The
// underlying model also has its own internal token limit.
const MAX_CHARS = 2000;

let pipelinePromise: Promise<EmbeddingPipeline> | null = null;

async function loadEmbedder(): Promise<EmbeddingPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const mod = (await import(
        /* @vite-ignore */ TRANSFORMERS_CDN_URL
      )) as { pipeline: PipelineFactory };

      return mod.pipeline("feature-extraction", MODEL_ID);
    })();
  }

  return pipelinePromise;
}

function cosineSimilarity(a: ArrayLike<number>, b: ArrayLike<number>) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export type SemanticRelevanceResult =
  | { available: true; similarity: number }
  | { available: false; reason: string };

/**
 * Compares a resume bullet against a job description using real sentence
 * embeddings computed entirely in the browser. Never throws - a failure
 * to load or run the model comes back as { available: false, reason }.
 */
export async function checkSemanticRelevance(
  bullet: string,
  jobDescription: string,
): Promise<SemanticRelevanceResult> {
  const trimmedBullet = bullet.trim();
  const trimmedJobDescription = jobDescription.trim();

  if (!trimmedBullet || !trimmedJobDescription) {
    return { available: false, reason: "Not enough text to compare yet." };
  }

  try {
    const embed = await loadEmbedder();
    const [bulletEmbedding, jobDescriptionEmbedding] = await Promise.all([
      embed(trimmedBullet.slice(0, MAX_CHARS), {
        pooling: "mean",
        normalize: true,
      }),
      embed(trimmedJobDescription.slice(0, MAX_CHARS), {
        pooling: "mean",
        normalize: true,
      }),
    ]);

    return {
      available: true,
      similarity: cosineSimilarity(
        bulletEmbedding.data,
        jobDescriptionEmbedding.data,
      ),
    };
  } catch (error) {
    return {
      available: false,
      reason:
        error instanceof Error
          ? error.message
          : "The local AI model could not be loaded.",
    };
  }
}
