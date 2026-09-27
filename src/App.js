import React, { useEffect, useState } from "react";
import Login from "./FE/Login";
import AIAssistant from "./FE/AIAssistant";
import { Drawer, Fab } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  Logout,
  Search,
  Edit,
  Delete,
  Clear,
  PersonAdd,
  SmartToy,
} from "@mui/icons-material";
const API_URL = process.env.REACT_APP_API_URL;
function App() {
  // AUTHENTICATION
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [aiOpen, setAiOpen] = useState(false);

  // EMPLOYEE STATE
  const [employees, setEmployees] = useState([]);

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    skill: "",
    experience: "",
    location: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search and filters
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const limit = 5;

  useEffect(() => {
    if (isLoggedIn) {
      getEmployees("", "", "", 1);
    }
  }, [isLoggedIn,getEmployees]);

  // LOGIN SUCCESS
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);
    setEmployees([]);
  };

  // GET EMPLOYEES
  const getEmployees = async (
    searchValue = search,
    skillValue = skillFilter,
    locationValue = locationFilter,
    pageValue = currentPage
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.append("search", searchValue.trim());
      }

      if (skillValue) {
        params.append("skill", skillValue);
      }

      if (locationValue) {
        params.append("location", locationValue);
      }

      params.append("page", pageValue);
      params.append("limit", limit);

      const response = await fetch(
        `${API_URL}/api/employees?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message || "Failed to fetch employees"
        );
      }

      const data = await response.json();

      setEmployees(data.employees);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalEmployees(data.totalEmployees);
    } catch (error) {
      console.log("Error fetching employees:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH
  const handleSearch = () => {
    getEmployees(search, skillFilter, locationFilter, 1);
  };

  // CLEAR SEARCH
  const handleClear = () => {
    setSearch("");
    setSkillFilter("");
    setLocationFilter("");

    getEmployees("", "", "", 1);
  };

  // PAGE CHANGE
  const handlePageChange = (event, page) => {
    getEmployees(search, skillFilter, locationFilter, page);
  };

  // EMPLOYEE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEmployee({
      ...employee,
      [name]: value,
    });
  };

  // VALIDATION
  const validateForm = () => {
    if (!employee.name.trim()) {
      return "Name is required";
    }

    if (employee.name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }

    if (!employee.email.trim()) {
      return "Email is required";
    }

    if (!employee.skill.trim()) {
      return "Skill is required";
    }

    if (employee.experience === "") {
      return "Experience is required";
    }

    if (Number(employee.experience) < 0) {
      return "Experience cannot be negative";
    }

    if (Number(employee.experience) > 50) {
      return "Experience cannot be more than 50";
    }

    if (!employee.location.trim()) {
      return "Location is required";
    }

    return null;
  };

  // ADD / UPDATE EMPLOYEE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const employeeData = {
        ...employee,
        experience: Number(employee.experience),
      };

      let response;

      if (editingId) {
        response = await fetch(
          `${API_URL}/api/employees/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(employeeData),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/api/employees`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(employeeData),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message || "Operation failed"
        );
      }

      await response.json();

      resetForm();

      await getEmployees(
        search,
        skillFilter,
        locationFilter,
        currentPage
      );
    } catch (error) {
      console.log("Error:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // EDIT EMPLOYEE
  const handleEdit = (employee) => {
    setEmployee({
      name: employee.name,
      email: employee.email,
      skill: employee.skill,
      experience: employee.experience,
      location: employee.location,
    });

    setEditingId(employee._id);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE EMPLOYEE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/employees/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message || "Delete failed"
        );
      }

      await response.json();

      await getEmployees(
        search,
        skillFilter,
        locationFilter,
        currentPage
      );
    } catch (error) {
      console.log("Error deleting employee:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // RESET FORM
  const resetForm = () => {
    setEmployee({
      name: "",
      email: "",
      skill: "",
      experience: "",
      location: "",
    });

    setEditingId(null);
    setError("");
  };

  // SHOW LOGIN PAGE
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // SHOW DASHBOARD
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f6f8",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              minHeight: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight={600}
              >
                Employee Management
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Employee management and AI assistant
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box sx={{ textAlign: "right" }}>
                <Typography fontWeight={600}>
                  {user?.name}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {user?.email}
                </Typography>
              </Box>

              <Chip
                label={user?.role}
                color={
                  user?.role === "admin"
                    ? "primary"
                    : "default"
                }
                size="small"
              />

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Logout />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{ py: 4 }}
      >
        {/* WELCOME */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            fontWeight={600}
          >
            Welcome, {user?.name}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage employees and use the AI assistant
            to get employee information.
          </Typography>
        </Box>

        {/* SUMMARY CARDS */}
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                Total Employees
              </Typography>

              <Typography
                variant="h4"
                fontWeight={600}
                sx={{ mt: 1 }}
              >
                {totalEmployees}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                Current Page
              </Typography>

              <Typography
                variant="h4"
                fontWeight={600}
                sx={{ mt: 1 }}
              >
                {currentPage}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                Your Role
              </Typography>

              <Typography
                variant="h4"
                fontWeight={600}
                sx={{ mt: 1 }}
              >
                {user?.role}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* AI ASSISTANT */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <SmartToy color="primary" />

              <Typography
                variant="h6"
                fontWeight={600}
              >
                AI Assistant
              </Typography>
            </Stack>
<Fab
  color="primary"
  onClick={() => setAiOpen(true)}
  sx={{
    position: "fixed",
    right: 24,
    bottom: 24,
  }}
>
  <SmartToyIcon />
</Fab>

<Drawer
  anchor="right"
  open={aiOpen}
  onClose={() => setAiOpen(false)}
>
  <Box
    sx={{
      width: {
        xs: "100vw",
        sm: 450,
      },
      height: "100vh",
    }}
  >
    <AIAssistant />
  </Box>
</Drawer>
            {/* <AIAssistant /> */}
          </CardContent>
        </Card>

        {/* ERROR */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* ADMIN FORM */}
        {user?.role === "admin" && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <PersonAdd color="primary" />

                <Typography
                  variant="h6"
                  fontWeight={600}
                >
                  {editingId
                    ? "Edit Employee"
                    : "Add Employee"}
                </Typography>
              </Stack>

              <Box
                component="form"
                onSubmit={handleSubmit}
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    spacing={2}
                  >
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={employee.name}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                    />

                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={employee.email}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>

                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    spacing={2}
                  >
                    <TextField
                      fullWidth
                      label="Skill"
                      name="skill"
                      value={employee.skill}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                    />

                    <TextField
                      fullWidth
                      label="Experience"
                      name="experience"
                      type="number"
                      value={employee.experience}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      inputProps={{
                        min: 0,
                        max: 50,
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={employee.location}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={2}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
                      {editingId
                        ? "Update Employee"
                        : "Add Employee"}
                    </Button>

                    {editingId && (
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<Clear />}
                        onClick={resetForm}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* SEARCH & FILTER */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 2 }}
            >
              Search & Filter Employees
            </Typography>

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={2}
            >
              <TextField
                fullWidth
                label="Search"
                placeholder="Name, email or skill"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                variant="outlined"
                size="small"
              />

              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>Skill</InputLabel>

                <Select
                  value={skillFilter}
                  label="Skill"
                  onChange={(e) =>
                    setSkillFilter(e.target.value)
                  }
                >
                  <MenuItem value="">
                    All Skills
                  </MenuItem>

                  <MenuItem value="React">
                    React
                  </MenuItem>

                  <MenuItem value="Java">
                    Java
                  </MenuItem>

                  <MenuItem value="Node">
                    Node
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>Location</InputLabel>

                <Select
                  value={locationFilter}
                  label="Location"
                  onChange={(e) =>
                    setLocationFilter(e.target.value)
                  }
                >
                  <MenuItem value="">
                    All Locations
                  </MenuItem>

                  <MenuItem value="Hyderabad">
                    Hyderabad
                  </MenuItem>

                  <MenuItem value="Bangalore">
                    Bangalore
                  </MenuItem>

                  <MenuItem value="Chennai">
                    Chennai
                  </MenuItem>
                </Select>
              </FormControl>

              <Stack
                direction="row"
                spacing={1}
              >
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Search
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* EMPLOYEE LIST */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                >
                  Employee List
                </Typography>

                {!loading && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {totalEmployees} employees found
                  </Typography>
                )}
              </Box>

              {loading && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Loading...
                </Typography>
              )}
            </Stack>

            {!loading &&
              employees.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ py: 4, textAlign: "center" }}
                >
                  No employees found.
                </Typography>
              )}

            {employees.length > 0 && (
              <TableContainer
                component={Paper}
                variant="outlined"
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Email</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Skill</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Experience</strong>
                      </TableCell>

                      <TableCell>
                        <strong>Location</strong>
                      </TableCell>

                      {user?.role === "admin" && (
                        <TableCell align="center">
                          <strong>Actions</strong>
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow
                        key={employee._id}
                        hover
                      >
                        <TableCell>
                          {employee.name}
                        </TableCell>

                        <TableCell>
                          {employee.email}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={employee.skill}
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          {employee.experience} years
                        </TableCell>

                        <TableCell>
                          {employee.location}
                        </TableCell>

                        {user?.role === "admin" && (
                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="center"
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() =>
                                  handleEdit(employee)
                                }
                                disabled={loading}
                              >
                                Edit
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() =>
                                  handleDelete(
                                    employee._id
                                  )
                                }
                                disabled={loading}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 0 && (
              <Stack
                direction="row"
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}

            {!loading && totalPages > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1 }}
              >
                Page {currentPage} of {totalPages}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default App;