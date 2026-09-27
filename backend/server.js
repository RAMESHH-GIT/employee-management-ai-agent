require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authMiddleware = require("./middleware/authMiddleWare");
const roleMiddleware = require("./middleware/roleMiddleware");

const aiRoutes = require("./routes/aiRoutes");

const Employee = require("./models/Employee");
const User = require("./models/User");

const app = express();

// ===============================
// ENVIRONMENT CHECK
// ===============================

console.log(
  "OpenAI key loaded:",
  !!process.env.OPENAI_API_KEY
);

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// AI ROUTES
// ===============================

app.use("/api/ai", aiRoutes);

// ===============================
// DATABASE CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) =>
    console.log("MongoDB connection error:", error)
  );

// ===============================
// HELPER
// ===============================

const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ===============================
// ROOT API
// ===============================

app.get("/", (req, res) => {
  res.send("Employee API is running");
});

// ===============================
// AUTHENTICATION
// ===============================

// REGISTER

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Register error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ===============================
// LOGIN
// ===============================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Login error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ===============================
// EMPLOYEE CREATE
// ADMIN ONLY
// ===============================

app.post(
  "/api/employees",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const employee = await Employee.create(req.body);

      res.status(201).json(employee);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: Object.values(error.errors).map(
            (err) => err.message
          ),
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// ===============================
// EMPLOYEE GET
// SEARCH + FILTER + PAGINATION
// ===============================

app.get(
  "/api/employees",
  authMiddleware,
  async (req, res) => {
    try {
      const { search, skill, location } = req.query;

      // Pagination

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;

      const skip = (page - 1) * limit;

      let query = {};

      // Search

      if (search && search.trim() !== "") {
        query.$or = [
          {
            name: {
              $regex: search.trim(),
              $options: "i",
            },
          },
          {
            email: {
              $regex: search.trim(),
              $options: "i",
            },
          },
          {
            skill: {
              $regex: search.trim(),
              $options: "i",
            },
          },
        ];
      }

      // Skill filter

      if (skill && skill.trim() !== "") {
        query.skill = {
          $regex: `^${skill.trim()}$`,
          $options: "i",
        };
      }

      // Location filter

      if (location && location.trim() !== "") {
        query.location = {
          $regex: `^${location.trim()}$`,
          $options: "i",
        };
      }

      console.log("Query:", query);
      console.log("Page:", page);
      console.log("Limit:", limit);
      console.log("Skip:", skip);

      // Get employees

      const employees = await Employee.find(query)
        .skip(skip)
        .limit(limit);

      // Total matching employees

      const totalEmployees =
        await Employee.countDocuments(query);

      // Total pages

      const totalPages = Math.ceil(
        totalEmployees / limit
      );

      res.json({
        employees,
        currentPage: page,
        totalPages,
        totalEmployees,
      });
    } catch (error) {
      console.log(
        "Error fetching employees:",
        error
      );

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// ===============================
// GET EMPLOYEE BY ID
// ===============================

app.get(
  "/api/employees/:id",
  authMiddleware,
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid employee ID",
        });
      }

      const employee =
        await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// ===============================
// UPDATE EMPLOYEE
// ADMIN ONLY
// ===============================

app.put(
  "/api/employees/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid employee ID",
        });
      }

      const employee =
        await Employee.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.json(employee);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: Object.values(error.errors).map(
            (err) => err.message
          ),
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// ===============================
// DELETE EMPLOYEE
// ADMIN ONLY
// ===============================

app.delete(
  "/api/employees/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid employee ID",
        });
      }

      const employee =
        await Employee.findByIdAndDelete(
          req.params.id
        );

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      res.json({
        message: "Employee deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});