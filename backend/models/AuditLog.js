const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userQuestion: {
      type: String,
      required: true,
    },

    toolUsed: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AuditLog",
  auditLogSchema
);