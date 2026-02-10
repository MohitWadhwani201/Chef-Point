import fetch from "node-fetch";

export const getEmbedding = async (text) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  const raw = await response.text();

  if (!response.ok) {
    console.error("Embedding raw error:", raw);
    throw new Error("Embedding failed");
  }

  const data = JSON.parse(raw);

  const embedding = data?.data?.[0]?.embedding;

  if (!embedding) throw new Error("Invalid embedding response");

  return embedding;
};

// cosine similarity
export const cosineSimilarity = (a, b) => {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};
