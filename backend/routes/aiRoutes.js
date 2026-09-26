// // const express = require("express");
// // const OpenAI = require("openai");

// // const router = express.Router();

// // const openai = new OpenAI({
// //   apiKey: process.env.OPENAI_API_KEY,
// // });

// // router.post("/chat", async (req, res) => {
// //   try {
// //     const { message } = req.body;

// //     if (!message || !message.trim()) {
// //       return res.status(400).json({
// //         message: "Message is required",
// //       });
// //     }

// //     const response = await openai.responses.create({
// //       model: "gpt-5.6-luna",
// //       input: message,
// //     });

// //     res.json({
// //       answer: response.output_text,
// //     });
// //   } catch (error) {
// //     console.error("AI error:", error);

// //     res.status(500).json({
// //       message: "AI request failed",
// //     });
// //   }
// // });

// // module.exports = router;

// const express = require("express");

// const router = express.Router();

// router.post("/chat", async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message || !message.trim()) {
//       return res.status(400).json({
//         message: "Message is required",
//       });
//     }

//     const response = await fetch(
//       "http://localhost:11434/api/chat",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           model: "llama3.2",
//           messages: [
//             {
//               role: "user",
//               content: message,
//             },
//           ],
//           stream: false,
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();

//       console.error("Ollama error:", errorText);

//       return res.status(500).json({
//         message: "Ollama request failed",
//       });
//     }

//     const data = await response.json();

//     res.json({
//       answer: data.message.content,
//     });
//   } catch (error) {
//     console.error("AI error:", error);

//     res.status(500).json({
//       message: "AI request failed",
//     });
//   }
// });

// module.exports = router;

// const express = require("express");
// const Employee = require("../models/Employee");

// const router = express.Router();

// // ===============================
// // AI CHAT
// // ===============================

// router.post("/chat", async (req, res) => {
//   try {
//     const { message } = req.body;

//     // Validate message
//     if (!message || !message.trim()) {
//       return res.status(400).json({
//         message: "Message is required",
//       });
//     }

//     // Get employees from MongoDB
//     const employees = await Employee.find();

//     // Convert employee data into simple text
//     const employeeData = employees
//       .map(
//         (employee) =>
//           `Name: ${employee.name}, Email: ${employee.email}, Skill: ${employee.skill}, Experience: ${employee.experience} years, Location: ${employee.location}`
//       )
//       .join("\n");

//     // Create prompt for AI
//     const prompt = `
// You are an Employee Management AI Assistant.

// Use the employee data below to answer the user's question.

// Employee Data:
// ${employeeData}

// User Question:
// ${message}

// Rules:
// - Answer only using the employee data when the question is about employees.
// - If the requested information is not available, say that it is not available.
// - Do not invent employee information.
// - Keep the answer simple and clear.
// `;

//     // Call Ollama
//     const response = await fetch(
//       "http://localhost:11434/api/chat",
//       {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           model: "llama3.2",

//           messages: [
//             {
//               role: "user",
//               content: prompt,
//             },
//           ],

//           stream: false,
//         }),
//       }
//     );

//     // Check Ollama response
//     if (!response.ok) {
//       const errorText = await response.text();

//       console.error("Ollama error:", errorText);

//       return res.status(500).json({
//         message: "Ollama request failed",
//       });
//     }

//     const data = await response.json();

//     res.json({
//       answer: data.message.content,
//     });
//   } catch (error) {
//     console.error("AI error:", error);

//     res.status(500).json({
//       message: "AI request failed",
//     });
//   }
// });

// module.exports = router;

const authMiddleware = require("../middleware/authMiddleWare");

const express = require("express");

const Employee = require("../models/Employee");

const Conversation = require("../models/Conversation");

const AuditLog = require("../models/AuditLog");

const {
  searchEmployeesByVector,
} = require("../utils/vectorSearch");

const {
  searchEmployees,
  getEmployee,
  createEmployee,
} = require("../tools/employeeTools");

const {
  createEmbedding,
} = require("../utils/embeddingService");

const createEmployeeText =
  require("../utils/employeeText");

const router = express.Router();


// ==================================================
// Helper: Call Ollama
// ==================================================

async function callOllama(messages, tools = undefined) {
  const body = {
    model: "llama3.2",
    messages,
    stream: false,
  };

  if (tools) {
    body.tools = tools;
  }

  const response = await fetch(
    "http://localhost:11434/api/chat",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Ollama error:",
      errorText
    );

    throw new Error(
      "Ollama request failed"
    );
  }

  return await response.json();
}


// ==================================================
// Tool Definitions
// ==================================================

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


// ==================================================
// AI CHAT
// ==================================================

router.post(
  "/chat",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        message,
        conversationId,
      } = req.body;

      // ============================================
      // 1. Validate message
      // ============================================

      if (
        !message ||
        !message.trim()
      ) {
        return res.status(400).json({
          message:
            "Message is required",
        });
      }

      // ============================================
      // 2. Create conversation ID
      // ============================================

      let currentConversationId =
        conversationId;

      if (!currentConversationId) {
        currentConversationId =
          Date.now().toString() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 9);
      }

      // ============================================
      // 3. Find conversation
      // ============================================

      let conversation =
        await Conversation.findOne({
          conversationId:
            currentConversationId,

          userId:
            req.user.userId,
        });

      // ============================================
      // 4. Create conversation
      // ============================================

      if (!conversation) {
        conversation =
          new Conversation({
            conversationId:
              currentConversationId,

            userId:
              req.user.userId,

            messages: [],
          });
      }


      // ==================================================
      // 5. CHECK CONFIRMATION FOR PENDING CREATE
      // ==================================================

      if (
        conversation.pendingCreate &&
        message.trim().toLowerCase() ===
          "yes"
      ) {
        const employeeData =
          conversation.pendingCreate;

        // ----------------------------------------------
        // Admin RBAC
        // ----------------------------------------------

        if (
          req.user.role !==
          "admin"
        ) {
          const answer =
            "Admin access required to create an employee.";

          conversation.messages.push({
            role: "user",
            content: message,
          });

          conversation.messages.push({
            role: "assistant",
            content: answer,
          });

          conversation.pendingCreate =
            undefined;

          await conversation.save();

          await AuditLog.create({
            userId:
              req.user.userId,

            userQuestion:
              message,

            toolUsed:
              "createEmployee",

            action:
              "CREATE_EMPLOYEE",

            status:
              "FAILED",
          });

          return res.json({
            answer,

            conversationId:
              currentConversationId,
          });
        }

        try {
          // --------------------------------------------
          // Create employee
          // --------------------------------------------

          const employee =
            await createEmployee({
              ...employeeData,

              user: req.user,
            });

          // --------------------------------------------
          // Generate embedding
          // --------------------------------------------

          const employeeText =
            createEmployeeText(
              employee
            );

          const embedding =
            await createEmbedding(
              employeeText
            );

          employee.embedding =
            embedding;

          await employee.save();

          // --------------------------------------------
          // Audit success
          // --------------------------------------------

          await AuditLog.create({
            userId:
              req.user.userId,

            userQuestion:
              `Create employee ${employee.name}`,

            toolUsed:
              "createEmployee",

            action:
              "CREATE_EMPLOYEE",

            status:
              "SUCCESS",
          });

          const answer =
            `Employee ${employee.name} created successfully.`;

          conversation.messages.push({
            role: "user",
            content: message,
          });

          conversation.messages.push({
            role: "assistant",
            content: answer,
          });

          conversation.pendingCreate =
            undefined;

          await conversation.save();

          return res.json({
            answer,

            conversationId:
              currentConversationId,
          });
        } catch (error) {
          // --------------------------------------------
          // Audit failure
          // --------------------------------------------

          await AuditLog.create({
            userId:
              req.user.userId,

            userQuestion:
              message,

            toolUsed:
              "createEmployee",

            action:
              "CREATE_EMPLOYEE",

            status:
              "FAILED",
          });

          throw error;
        }
      }


      // ==================================================
      // 6. CANCEL PENDING CREATE
      // ==================================================

      if (
        conversation.pendingCreate &&
        message.trim().toLowerCase() ===
          "no"
      ) {
        const answer =
          "Employee creation cancelled.";

        conversation.messages.push({
          role: "user",
          content: message,
        });

        conversation.messages.push({
          role: "assistant",
          content: answer,
        });

        conversation.pendingCreate =
          undefined;

        await conversation.save();

        return res.json({
          answer,

          conversationId:
            currentConversationId,
        });
      }


      // ==================================================
      // 7. CHECK CREATE EMPLOYEE REQUEST
      // ==================================================

      const createRequest =
        /\b(create|add|register)\b.*\b(employee|developer|staff|person)\b/i.test(
          message
        );

      if (createRequest) {
        // ----------------------------------------------
        // Extract employee details using AI
        // ----------------------------------------------

        const extractionResponse =
          await callOllama([
            {
              role: "system",

              content: `
You extract employee information from the user's request.

Return ONLY valid JSON.

Required fields:
name
email
skill
experience
location

If a field is missing, use null.

Do not invent values.
Do not use information from previous employees.
Do not add extra fields.
`,
            },

            {
              role: "user",

              content: message,
            },
          ]);

        let aiContent =
          extractionResponse
            .message?.content || "";

        // ----------------------------------------------
        // Remove Markdown JSON fences
        // ----------------------------------------------

        aiContent =
          aiContent
            .replace(
              /```json/g,
              ""
            )
            .replace(
              /```/g,
              ""
            )
            .trim();

        let employeeData;

        try {
          employeeData =
            JSON.parse(
              aiContent
            );
        } catch (error) {
          return res.status(500).json({
            message:
              "AI could not extract employee details",
          });
        }

        // ----------------------------------------------
        // Check required fields
        // ----------------------------------------------

        const missingFields = [];

        if (!employeeData.name) {
          missingFields.push(
            "name"
          );
        }

        if (!employeeData.email) {
          missingFields.push(
            "email"
          );
        }

        if (!employeeData.skill) {
          missingFields.push(
            "skill"
          );
        }

        if (
          employeeData.experience ===
          null ||
          employeeData.experience ===
          undefined
        ) {
          missingFields.push(
            "experience"
          );
        }

        if (!employeeData.location) {
          missingFields.push(
            "location"
          );
        }

        if (
          missingFields.length > 0
        ) {
          const answer =
            `Please provide the following employee details: ${missingFields.join(
              ", "
            )}.`;

          conversation.messages.push({
            role: "user",
            content: message,
          });

          conversation.messages.push({
            role: "assistant",
            content: answer,
          });

          await conversation.save();

          return res.json({
            answer,

            conversationId:
              currentConversationId,
          });
        }

        // ----------------------------------------------
        // Store pending employee
        // ----------------------------------------------

        conversation.pendingCreate =
          employeeData;

        const answer = `
Name: ${employeeData.name}
Email: ${employeeData.email}
Skill: ${employeeData.skill}
Experience: ${employeeData.experience} years
Location: ${employeeData.location}

Do you want to proceed with creating the employee? (yes/no)
`.trim();

        conversation.messages.push({
          role: "user",
          content: message,
        });

        conversation.messages.push({
          role: "assistant",
          content: answer,
        });

        await conversation.save();

        return res.json({
          answer,

          conversationId:
            currentConversationId,
        });
      }


      // ==================================================
      // 8. VECTOR RAG
      // ==================================================

      const vectorResults =
        await searchEmployeesByVector(
          message,
          5
        );

      const employeeData =
        vectorResults
          .map(
            (result) =>
              `Name: ${result.employee.name}, Email: ${result.employee.email}, Skill: ${result.employee.skill}, Experience: ${result.employee.experience} years, Location: ${result.employee.location}, Similarity: ${result.score.toFixed(
                3
              )}`
          )
          .join("\n");


      // ==================================================
      // 9. Conversation History
      // ==================================================

      const conversationHistory =
        conversation.messages
          .map(
            (item) =>
              `${
                item.role ===
                "user"
                  ? "User"
                  : "Assistant"
              }: ${item.content}`
          )
          .join("\n");


      // ==================================================
      // 10. Agent / Tool Calling
      // ==================================================

      const messages = [
        {
          role: "system",

          content: `
You are an Employee Management AI Assistant.

Use the available tools when the user asks for
specific employee information.

Employee information retrieved using vector search:

${employeeData}

Previous Conversation:

${
  conversationHistory ||
  "No previous conversation."
}

Rules:
- Do not invent employee information.
- Use tools for specific employee lookups.
- Use retrieved employee information when relevant.
- Keep answers simple and clear.
`,
        },

        {
          role: "user",

          content: message,
        },
      ];


      let answer = "";

      // ==================================================
      // 11. Basic Agent Loop
      // ==================================================

      for (
        let step = 0;
        step < 5;
        step++
      ) {
        const data =
          await callOllama(
            messages,
            tools
          );

        const assistantMessage =
          data.message;

        messages.push(
          assistantMessage
        );

        // ----------------------------------------------
        // No tool required
        // ----------------------------------------------

        if (
          !assistantMessage.tool_calls ||
          assistantMessage
            .tool_calls.length ===
            0
        ) {
          answer =
            assistantMessage.content;

          break;
        }

        // ----------------------------------------------
        // Execute selected tool
        // ----------------------------------------------

        for (
          const toolCall of
            assistantMessage.tool_calls
        ) {
          const toolName =
            toolCall.function
              .name;

          const args =
            toolCall.function
              .arguments;

          let result;

          if (
            toolName ===
            "searchEmployees"
          ) {
            result =
              await searchEmployees(
                args
              );
          } else if (
            toolName ===
            "getEmployee"
          ) {
            result =
              await getEmployee(
                args
              );
          } else {
            result = {
              error:
                "Unknown tool",
            };
          }

          // --------------------------------------------
          // Audit tool execution
          // --------------------------------------------

          await AuditLog.create({
            userId:
              req.user.userId,

            userQuestion:
              message,

            toolUsed:
              toolName,

            action:
              toolName ===
              "searchEmployees"
                ? "SEARCH_EMPLOYEES"
                : "GET_EMPLOYEE",

            status:
              result?.error
                ? "FAILED"
                : "SUCCESS",
          });

          // --------------------------------------------
          // Send result back to AI
          // --------------------------------------------

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


      // ==================================================
      // 12. Save Conversation
      // ==================================================

      conversation.messages.push({
        role: "user",

        content: message,
      });

      conversation.messages.push({
        role: "assistant",

        content: answer,
      });

      await conversation.save();


      // ==================================================
      // 13. Return Response
      // ==================================================

      res.json({
        answer,

        conversationId:
          currentConversationId,
      });
    } catch (error) {
      console.error(
        "AI error:",
        error
      );

      res.status(500).json({
        message:
          "AI request failed",
      });
    }
  }
);


// ==================================================
// GET SINGLE CONVERSATION
// ==================================================

router.get(
  "/conversation/:conversationId",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        conversationId,
      } = req.params;

      const conversation =
        await Conversation.findOne({
          conversationId,

          userId:
            req.user.userId,
        });

      if (!conversation) {
        return res.status(404).json({
          message:
            "Conversation not found",
        });
      }

      res.json({
        conversation,
      });
    } catch (error) {
      console.error(
        "Get conversation error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to get conversation",
      });
    }
  }
);


// ==================================================
// GET ALL CONVERSATIONS
// ==================================================

router.get(
  "/conversations",
  authMiddleware,
  async (req, res) => {
    try {
      const conversations =
        await Conversation.find({
          userId:
            req.user.userId,
        })
          .sort({
            updatedAt: -1,
          })
          .select(
            "conversationId messages createdAt updatedAt"
          );

      const conversationList =
        conversations.map(
          (conversation) => {
            const firstUserMessage =
              conversation.messages.find(
                (item) =>
                  item.role ===
                  "user"
              );

            return {
              conversationId:
                conversation.conversationId,

              title:
                firstUserMessage
                  ? firstUserMessage.content
                  : "New Conversation",

              createdAt:
                conversation.createdAt,

              updatedAt:
                conversation.updatedAt,
            };
          }
        );

      res.json({
        conversations:
          conversationList,
      });
    } catch (error) {
      console.error(
        "Get conversations error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to get conversations",
      });
    }
  }
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;
