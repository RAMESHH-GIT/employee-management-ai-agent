const {
  createEmbedding,
} = require("./embeddingService");

async function test() {
  const vector = await createEmbedding(
    "Ramesh is a React developer in Hyderabad"
  );

  console.log("Vector created");
  console.log("Dimensions:", vector.length);
  console.log("First 10 values:", vector.slice(0, 10));
}

test();