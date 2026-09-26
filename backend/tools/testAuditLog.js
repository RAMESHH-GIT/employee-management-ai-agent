require("dotenv").config();

const mongoose = require("mongoose");

const AuditLog = require("../models/AuditLog");

async function testAuditLog() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    const log = await AuditLog.create({
      userId: "6ab6280eb4989289f58632a1",

      userQuestion:
        "Create John Smith as a React developer",

      toolUsed: "createEmployee",

      action: "CREATE_EMPLOYEE",

      status: "SUCCESS",
    });

    console.log(
      "\nAudit log created successfully:"
    );

    console.log(log);
  } catch (error) {
    console.error(
      "\nAudit log error:",
      error.message
    );
  } finally {
    await mongoose.disconnect();
  }
}

testAuditLog();