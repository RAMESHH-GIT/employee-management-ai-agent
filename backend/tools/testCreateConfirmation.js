require("dotenv").config();

async function createConfirmation() {
  try {
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
              role: "system",

              content: `
You are an employee management assistant.

The user wants to create an employee.

Create a confirmation message using the
employee information provided.

Do NOT say that the employee was created.

Ask the user to confirm before creation.
`,
            },

            {
              role: "user",

              content: `
Employee information:

Name: John Smith
Email: john.smith@example.com
Skill: React developer
Experience: 5 years
Location: Hyderabad

Ask the user for confirmation.
`,
            },
          ],

          stream: false,
        }),
      }
    );

    const data =
      await response.json();

    console.log(
      "\nAI Confirmation Message:\n"
    );

    console.log(
      data.message?.content
    );

  } catch (error) {
    console.error(
      "Confirmation error:",
      error
    );
  }
}

createConfirmation();