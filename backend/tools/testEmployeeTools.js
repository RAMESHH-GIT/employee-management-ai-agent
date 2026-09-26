require("dotenv").config();

const mongoose = require("mongoose");

const {
  searchEmployees,
} = require("./employeeTools");

async function test() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    // Test the searchEmployees tool
    const employees =
      await searchEmployees({
        skill: "React",
        location: "Hyderabad",
      });

    console.log(
      "\nSearch Employees Tool Result:\n"
    );

    employees.forEach(
      (employee, index) => {
        console.log(
          `${index + 1}. ${employee.name}`
        );

        console.log(
          `Email: ${employee.email}`
        );

        console.log(
          `Skill: ${employee.skill}`
        );

        console.log(
          `Experience: ${employee.experience} years`
        );

        console.log(
          `Location: ${employee.location}`
        );

        console.log(
          "----------------------"
        );
      }
    );
  } catch (error) {
    console.error(
      "Tool test error:",
      error
    );
  } finally {
    await mongoose.disconnect();
  }
}

test();