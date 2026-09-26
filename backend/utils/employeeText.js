function createEmployeeText(employee) {
  return `
Name: ${employee.name}
Email: ${employee.email}
Skill: ${employee.skill}
Experience: ${employee.experience} years
Location: ${employee.location}
`.trim();
}

module.exports = createEmployeeText;