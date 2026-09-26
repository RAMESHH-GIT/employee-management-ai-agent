const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },

        content: {
          type: String,
          required: true,
        },
      },
    ],

    // =====================================
    // Pending AI employee creation
    // =====================================

    pendingCreate: {
      name: String,
      email: String,
      skill: String,
      experience: Number,
      location: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);