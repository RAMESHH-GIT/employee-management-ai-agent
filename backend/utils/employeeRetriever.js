const Employee = require("../models/Employee");

async function retrieveRelevantEmployees(message) {
  try {
    const searchText = message.toLowerCase();

    const employees = await Employee.find();

    const relevantEmployees = employees.filter((employee) => {
      const name = employee.name?.toLowerCase() || "";
      const email = employee.email?.toLowerCase() || "";
      const skill = employee.skill?.toLowerCase() || "";
      const location = employee.location?.toLowerCase() || "";

      const experience =
        employee.experience !== undefined
          ? employee.experience.toString()
          : "";

      return (
        searchText.includes(name) ||
        searchText.includes(email) ||
        searchText.includes(skill) ||
        searchText.includes(location) ||
        searchText.includes(experience)
      );
    });

    return relevantEmployees;
  } catch (error) {
    console.error(
      "Employee retrieval error:",
      error
    );

    return [];
  }
}

module.exports = retrieveRelevantEmployees;