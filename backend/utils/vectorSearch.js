const Employee = require("../models/Employee");
const {
  createEmbedding,
} = require("./embeddingService");

function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];

    magnitudeA += vectorA[i] * vectorA[i];

    magnitudeB += vectorB[i] * vectorB[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) *
      Math.sqrt(magnitudeB))
  );
}

async function searchEmployeesByVector(
  query,
  topK = 5
) {
  const queryEmbedding =
    await createEmbedding(query);

  const employees =
    await Employee.find({
      embedding: {
        $exists: true,
        $ne: [],
      },
    });

  const results = employees.map(
    (employee) => {
      const score =
        cosineSimilarity(
          queryEmbedding,
          employee.embedding
        );

      return {
        employee,
        score,
      };
    }
  );

  results.sort(
    (a, b) => b.score - a.score
  );

  return results.slice(0, topK);
}

module.exports = {
  cosineSimilarity,
  searchEmployeesByVector,
};