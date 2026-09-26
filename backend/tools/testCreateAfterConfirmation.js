require("dotenv").config();

const mongoose = require("mongoose");

const {
  createEmployee,
} = require("./employeeTools");

const {
  createEmbedding,
} = require("../utils/embeddingService");

const createEmployeeText =
  require("../utils/employeeText");

async function createAfterConfirmation() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    // -------------------------------------
    // Employee data extracted by AI
    // -------------------------------------

    const employeeData = {
      name: "John Smith",
      email: "john.smith@example.com",
      skill: "React developer",
      experience: 5,
      location: "Hyderabad",
    };

    // -------------------------------------
    // Simulate user's confirmation
    // -------------------------------------

    const userConfirmation = "yes";

    if (
      userConfirmation.toLowerCase() !==
      "yes"
    ) {
      console.log(
        "Employee creation cancelled."
      );

      return;
    }

    console.log(
      "\nUser confirmed employee creation."
    );

    // -------------------------------------
    // Admin user
    // -------------------------------------

    const user = {
      role: "admin",
    };

    // -------------------------------------
    // Create employee
    // -------------------------------------

    const employee =
      await createEmployee({
        ...employeeData,
        user,
      });

    console.log(
      "\nEmployee created successfully:"
    );

    console.log({
      name: employee.name,
      email: employee.email,
      skill: employee.skill,
      experience: employee.experience,
      location: employee.location,
    });

    // -------------------------------------
    // Generate embedding
    // -------------------------------------

    console.log(
      "\nGenerating employee embedding..."
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
      "Employee embedding saved successfully."
    );

    console.log(
      "\nAI Create Employee Flow Completed."
    );
  } catch (error) {
    console.error(
      "\nCreate employee error:",
      error.message
    );
  } finally {
    await mongoose.disconnect();
  }
}

createAfterConfirmation();