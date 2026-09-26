require("dotenv").config();

const mongoose = require("mongoose");

const {
  searchEmployees,
  getEmployee,
} = require("./employeeTools");

const AuditLog = require("../models/AuditLog");

// =====================================
// Ollama Tools
// =====================================

const tools = [
  {
    type: "function",

    function: {
      name: "searchEmployees",

      description:
        "Search employees by skill, location, or name",

      parameters: {
        type: "object",

        properties: {
          skill: {
            type: "string",
            description:
              "Employee skill",
          },

          location: {
            type: "string",
            description:
              "Employee location",
          },

          name: {
            type: "string",
            description:
              "Employee name",
          },
        },
      },
    },
  },

  {
    type: "function",

    function: {
      name: "getEmployee",

      description:
        "Get details of one employee by name or email",

      parameters: {
        type: "object",

        properties: {
          name: {
            type: "string",
            description:
              "Employee name",
          },

          email: {
            type: "string",
            description:
              "Employee email",
          },
        },
      },
    },
  },
];

// =====================================
// Agent
// =====================================

async function runAgent() {
  try {
    // ---------------------------------
    // MongoDB connection
    // ---------------------------------

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected"
    );

    // ---------------------------------
    // User question
    // ---------------------------------

    const messages = [
      {
        role: "user",

        content:
          "Get the details of Ramesh",
      },
    ];

    // ---------------------------------
    // Agent Loop
    // ---------------------------------

    for (
      let step = 0;
      step < 5;
      step++
    ) {
      console.log(
        `\nAgent Step ${step + 1}`
      );

      // ---------------------------------
      // Call Ollama
      // ---------------------------------

      const response =
        await fetch(
          "http://localhost:11434/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              model: "llama3.2",

              messages,

              tools,

              stream: false,
            }),
          }
        );

      const data =
        await response.json();

      const assistantMessage =
        data.message;

      // ---------------------------------
      // Add AI response to conversation
      // ---------------------------------

      messages.push(
        assistantMessage
      );

      // ---------------------------------
      // Check whether AI wants a tool
      // ---------------------------------

      if (
        !assistantMessage.tool_calls ||
        assistantMessage.tool_calls
          .length === 0
      ) {
        console.log(
          "\nFINAL AI ANSWER:\n"
        );

        console.log(
          assistantMessage.content
        );

        break;
      }

      // ---------------------------------
      // Execute AI selected tools
      // ---------------------------------

      for (
        const toolCall
        of assistantMessage.tool_calls
      ) {
        const toolName =
          toolCall.function.name;

        const args =
          toolCall.function.arguments;

        console.log(
          "\nAI selected tool:",
          toolName
        );

        console.log(
          "Arguments:",
          args
        );

        let result;

        let action;

        // ---------------------------------
        // Search Employees
        // ---------------------------------

        if (
          toolName ===
          "searchEmployees"
        ) {
          result =
            await searchEmployees(
              args
            );

          action =
            "SEARCH_EMPLOYEES";
        }

        // ---------------------------------
        // Get Employee
        // ---------------------------------

        else if (
          toolName ===
          "getEmployee"
        ) {
          result =
            await getEmployee(
              args
            );

          action =
            "GET_EMPLOYEE";
        }

        // ---------------------------------
        // Unknown Tool
        // ---------------------------------

        else {
          result = {
            error:
              "Unknown tool",
          };

          action =
            "UNKNOWN_TOOL";
        }

        // ---------------------------------
        // Show Tool Result
        // ---------------------------------

        console.log(
          "\nTool result:"
        );

        console.log(
          JSON.stringify(
            result,
            null,
            2
          )
        );

        // ---------------------------------
        // Create Audit Log
        // ---------------------------------

        await AuditLog.create({
          userId:
            "6ab6280eb4989289f58632a1",

          userQuestion:
            messages[0].content,

          toolUsed:
            toolName,

          action:
            action,

          status:
            result?.error
              ? "FAILED"
              : "SUCCESS",
        });

        console.log(
          "\nAudit log created successfully."
        );

        // ---------------------------------
        // Send Tool Result Back to AI
        // ---------------------------------

        messages.push({
          role: "tool",

          content:
            JSON.stringify(
              result
            ),

          tool_name:
            toolName,
        });
      }
    }
  } catch (error) {
    console.error(
      "\nAgent error:",
      error
    );
  } finally {
    await mongoose.disconnect();
  }
}

runAgent();