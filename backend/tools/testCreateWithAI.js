require("dotenv").config();

async function extractEmployeeDetails() {
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
You extract employee information from the user's request.

Return ONLY valid JSON.

Required fields:
name
email
skill
experience
location

If a field is missing, use null.

Do not add extra fields.
`,
            },

            {
              role: "user",

              content:
                "Create a new employee named John Smith, email john.smith@example.com, React developer, 5 years experience, located in Hyderabad.",
            },
          ],

          stream: false,
        }),
      }
    );

    const data =
      await response.json();

    console.log(
      "\nAI Raw Response:\n"
    );

    console.log(
      data.message?.content
    );

    // ---------------------------------
    // Convert AI JSON into JavaScript
    // ---------------------------------

   

   // ---------------------------------
// Convert AI JSON into JavaScript
// ---------------------------------

const aiContent =
  data.message.content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

const employeeData =
  JSON.parse(aiContent);

console.log(
  "\nExtracted Employee Data:\n"
);

console.log(
  employeeData
);

  } catch (error) {
    console.error(
      "\nAI extraction error:",
      error
    );
  }
}

extractEmployeeDetails();