async function createEmbedding(text) {
  try {
    const response = await fetch(
      "http://localhost:11434/api/embed",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nomic-embed-text",
          input: text,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Embedding API error:",
        errorText
      );

      throw new Error("Failed to create embedding");
    }

    const data = await response.json();

    return data.embeddings[0];
  } catch (error) {
    console.error(
      "Embedding service error:",
      error
    );

    throw error;
  }
}

module.exports = {
  createEmbedding,
};