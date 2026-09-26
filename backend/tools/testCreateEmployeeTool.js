require("dotenv").config();

const mongoose = require("mongoose");

const {
  createEmployee,
} = require("./employeeTools");

async function test() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    // =====================================
    // Test 1: Normal user
    // =====================================

    console.log(
      "\nTest 1: Normal user\n"
    );

    try {
      await createEmployee({
        name: "AI Test Employee",
        email: "aitest@example.com",
        skill: "React",
        experience: 5,
        location: "Hyderabad",

        user: {
          role: "user",
        },
      });

    } catch (error) {
      console.log(
        "Result:",
        error.message
      );
    }


    // =====================================
    // Test 2: Admin
    // =====================================

    console.log(
      "\nTest 2: Admin user\n"
    );

    console.log(
      "Admin is allowed to execute the tool."
    );

    /*
      We are NOT creating an employee here.

      Actual creation will happen later
      through the AI confirmation flow.
    */
  } catch (error) {
    console.error(
      "Test error:",
      error
    );
  } finally {
    await mongoose.disconnect();
  }
}

test();