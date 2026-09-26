require("dotenv").config();

const mongoose = require("mongoose");

const {
  searchEmployees,
} = require("./employeeTools");

async function testToolCalling() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    // ---------------------------------
    // Define the tool for Ollama
    // ---------------------------------

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
                  "Employee skill such as React or Node.js",
              },

              location: {
                type: "string",
                description:
                  "Employee location such as Hyderabad",
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
    ];

    // ---------------------------------
    // Ask Ollama
    // ---------------------------------

    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: "llama3.2",

          messages: [
            {
              role: "user",
              content:
                "Find React developers in Hyderabad",
            },
          ],

          tools,

          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `Ollama error: ${errorText}`
      );
    }

    const data =
      await response.json();

    console.log(
      "\nOllama Response:\n"
    );

    console.log(
      JSON.stringify(
        data,
        null,
        2
      )
    );

    // ---------------------------------
    // Check if AI requested a tool
    // ---------------------------------

    const toolCalls =
      data.message?.tool_calls;

    if (
      !toolCalls ||
      toolCalls.length === 0
    ) {
      console.log(
        "\nNo tool call returned by Ollama."
      );

      return;
    }

    console.log(
      "\nAI requested tool:\n"
    );

    for (const toolCall of toolCalls) {
      console.log(
        "Tool:",
        toolCall.function.name
      );

      console.log(
        "Arguments:",
        toolCall.function.arguments
      );

      // ---------------------------------
      // Execute our real backend tool
      // ---------------------------------

      if (
        toolCall.function.name ===
        "searchEmployees"
      ) {
        const result =
          await searchEmployees(
            toolCall.function.arguments
          );

        console.log(
          "\nTool Result:\n"
        );

        result.forEach(
          (employee, index) => {
            console.log(
              `${index + 1}. ${employee.name}`
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
      }
    }
  } catch (error) {
    console.error(
      "\nTool calling test error:",
      error
    );
  } finally {
    await mongoose.disconnect();
  }
}

testToolCalling();