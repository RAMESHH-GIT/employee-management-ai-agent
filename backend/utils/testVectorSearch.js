require("dotenv").config();

const mongoose = require("mongoose");

const {
  searchEmployeesByVector,
} = require("./vectorSearch");

async function test() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    const query =
      "Which employees have frontend development experience?";

    const results =
      await searchEmployeesByVector(
        query,
        5
      );

    console.log("\nVector Search Results:\n");

    results.forEach(
      (result, index) => {
        console.log(
          `${index + 1}. ${result.employee.name}`
        );

        console.log(
          `Skill: ${result.employee.skill}`
        );

        console.log(
          `Location: ${result.employee.location}`
        );

        console.log(
          `Experience: ${result.employee.experience}`
        );

        console.log(
          `Similarity: ${result.score}`
        );

        console.log(
          "----------------------"
        );
      }
    );
  } catch (error) {
    console.error(
      "Vector search error:",
      error
    );
  } finally {
    await mongoose.disconnect();
  }
}

test();