const Employee = require("../models/Employee");

// =====================================
// TOOL 1: Search Employees
// =====================================

async function searchEmployees({
  skill,
  location,
  name,
}) {
  const filter = {};

  if (skill) {
    filter.skill = new RegExp(
      `^${skill}$`,
      "i"
    );
  }

  if (location) {
    filter.location = new RegExp(
      `^${location}$`,
      "i"
    );
  }

  if (name) {
    filter.name = new RegExp(
      name,
      "i"
    );
  }

  const employees =
    await Employee.find(filter)
      .select(
        "name email skill experience location"
      );

  return employees;
}


// =====================================
// TOOL 2: Get One Employee
// =====================================

async function getEmployee({
  name,
  email,
}) {
  let employee;

  if (email) {
    employee =
      await Employee.findOne({
        email: email.toLowerCase(),
      }).select(
        "name email skill experience location"
      );
  } else if (name) {
    employee =
      await Employee.findOne({
        name: new RegExp(
          `^${name}$`,
          "i"
        ),
      }).select(
        "name email skill experience location"
      );
  }

  return employee;
}


// =====================================
// TOOL 3: Create Employee
// =====================================

async function createEmployee({
  name,
  email,
  skill,
  experience,
  location,
  user,
}) {
  // Only admin can create employees
  if (!user || user.role !== "admin") {
    throw new Error(
      "Admin access required to create an employee"
    );
  }

  const existingEmployee =
    await Employee.findOne({
      email: email.toLowerCase(),
    });

  if (existingEmployee) {
    throw new Error(
      "Employee with this email already exists"
    );
  }

  const employee =
    await Employee.create({
      name,
      email,
      skill,
      experience,
      location,
    });

  return employee;
}


module.exports = {
  searchEmployees,
  getEmployee,
  createEmployee,
};