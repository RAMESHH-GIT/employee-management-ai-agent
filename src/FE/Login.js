import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
const API_URL = process.env.REACT_APP_API_URL;
function Login({ onLoginSuccess }) {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoginLoading(true);
      setLoginError("");

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLoginSuccess(data.user);
    } catch (error) {
      console.log("Login error:", error);
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f6f8",
        px: 2,
      }}
    >
      <Card
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
            >
              Employee Management
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Sign in to continue
            </Typography>
          </Box>

          {/* Error */}
          {loginError && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              {loginError}
            </Alert>
          )}

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleLogin}
          >
            <TextField
              fullWidth
              required
              label="Email"
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleLoginChange}
              placeholder="Enter your email"
              variant="outlined"
              margin="normal"
              slotProps={{
                input: {
                  startAdornment: (
                    <EmailIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="Password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              placeholder="Enter your password"
              variant="outlined"
              margin="normal"
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <LockIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "text.secondary" }}
                    />
                  ),
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loginLoading}
              sx={{
                height: 44,
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              {loginLoading ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;