import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Container, Paper, Stack, Toolbar, Typography } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ExcelUploadPage from "./pages/ExcelUploadPage";
import TablePage from "./pages/TablePage";
import PrivateRoute from "./routes/PrivateRoute";
import Chatbot from "./components/chatbot/Chatbot";
import { useAuth } from "./hooks/useAuth";

// Inline SVG Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
);

const UploadFileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
  </svg>
);

const TableIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 4v16h14V4H5zm12 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V8h10v2z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

function App() {
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { path: "/upload", label: "Upload PDF", icon: UploadFileIcon },
    { path: "/import-excel", label: "Import Excel", icon: ExcelIcon },
    { path: "/table", label: "Orders Table", icon: TableIcon },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {isAuthenticated && (
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)"
          }}
        >
          <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            {/* Logo / Brand */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mr: 3,
                cursor: "pointer"
              }}
              onClick={() => navigate("/dashboard")}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  display: { xs: "none", sm: "block" },
                  letterSpacing: 0.5
                }}
              >
                PO Portal
              </Typography>
            </Box>

            {/* Navigation Items */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flex: 1,
                justifyContent: { xs: "center", md: "flex-start" },
                flexWrap: "wrap",
                gap: 0.5
              }}
            >
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    startIcon={<IconComponent />}
                    sx={{
                      color: active ? "#667eea" : "white",
                      background: active ? "white" : "rgba(255,255,255,0.1)",
                      borderRadius: 2,
                      px: { xs: 1.5, md: 2 },
                      py: 1,
                      fontWeight: 600,
                      fontSize: { xs: "0.75rem", md: "0.875rem" },
                      textTransform: "none",
                      minWidth: { xs: "auto", md: 120 },
                      backdropFilter: active ? "none" : "blur(10px)",
                      border: "1px solid",
                      borderColor: active ? "white" : "rgba(255,255,255,0.2)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "white",
                        color: "#667eea",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                      }
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        display: { xs: active ? "inline" : "none", sm: "inline" }
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Button>
                );
              })}
            </Stack>

            {/* Logout Button */}
            <Button
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{
                color: "white",
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                px: { xs: 1, md: 2 },
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease",
                ml: 2,
                "&:hover": {
                  background: "rgba(255,255,255,0.2)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }
              }}
            >
              <Typography
                component="span"
                sx={{
                  display: { xs: "none", sm: "inline" }
                }}
              >
                Logout
              </Typography>
            </Button>
          </Toolbar>
        </AppBar>
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
