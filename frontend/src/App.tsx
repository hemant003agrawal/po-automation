import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Stack } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ExcelUploadPage from "./pages/ExcelUploadPage";
import TablePage from "./pages/TablePage";
import PrivateRoute from "./routes/PrivateRoute";
import Chatbot from "./components/chatbot/Chatbot";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6fa" }}>
      {isAuthenticated && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: { xs: 1.5, md: 2 },
            bgcolor: "white",
            borderBottom: "1px solid #eee",
            flexWrap: "wrap",
            rowGap: 1
          }}
        >
          <Button
            variant={isActive("/dashboard") ? "contained" : "outlined"}
            onClick={() => navigate("/dashboard")}
            size="small"
          >
            Dashboard
          </Button>
          <Button
            variant={isActive("/upload") ? "contained" : "outlined"}
            onClick={() => navigate("/upload")}
            size="small"
          >
            Upload PDF
          </Button>
          <Button
            variant={isActive("/import-excel") ? "contained" : "outlined"}
            onClick={() => navigate("/import-excel")}
            size="small"
          >
            Import Excel
          </Button>
          <Button
            variant={isActive("/table") ? "contained" : "outlined"}
            onClick={() => navigate("/table")}
            size="small"
          >
            Orders Table
          </Button>
          <Button color="error" variant="text" onClick={logout} size="small">
            Logout
          </Button>
        </Stack>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/import-excel" element={<ExcelUploadPage />} />
          <Route path="/table" element={<TablePage />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>

      {isAuthenticated && <Chatbot />}
    </Box>
  );
}

export default App;
