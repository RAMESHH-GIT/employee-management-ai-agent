require("dotenv").config();

const mongoose = require("mongoose");

const Employee = require("../models/Employee");

const {
  createEmbedding,
} = require("./embeddingService");

const createEmployeeText =
  require("./employeeText");

async function generateEmbeddings() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected"
    );

    const employees =
      await Employee.find();

    console.log(
      `Found ${employees.length} employees`
    );

    for (const employee of employees) {
      console.log(
        `Creating embedding for: ${employee.name}`
      );

      const employeeText =
        createEmployeeText(employee);

      const embedding =
        await createEmbedding(
          employeeText
        );

      employee.embedding =
        embedding;

      await employee.save();

      console.log(
        `Embedding saved for: ${employee.name}`
      );
    }

    console.log(
      "All employee embeddings generated successfully"
    );
  } catch (error) {
    console.error(
      "Embedding generation error:",
      error
    );
  } finally {
    await mongoose.disconnect();
  }
}

generateEmbeddings();