// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },

//   email: {
//     type: String,
//     required: true,
//   },

//   skill: {
//     type: String,
//     required: true,
//   },

//   experience: {
//     type: Number,
//     required: true,
//   },

//   location: {
//     type: String,
//     required: true,
//   },
// });

// module.exports = mongoose.model("Employee", employeeSchema);
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email",
      ],
    },

    skill: {
      type: String,
      required: [true, "Skill is required"],
      trim: true,
    },

    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience cannot be more than 50"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
     embedding: {
      type: [Number],
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);