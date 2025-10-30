import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import LandingPage from "./pages/landing/LandingPage";
import OAuthCallback from "./pages/auth/OAuthCallback";
import OAuthError from "./pages/auth/OAuthError";
import PlannerListPage from "./pages/planner/PlannerListPage";
import PlannerDetailPage from "./pages/planner/PlannerDetailPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1a73e8",
    },
    secondary: {
      main: "#0f9d58",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/oauth2/callback" element={<OAuthCallback />} />
            <Route path="/oauth2/error" element={<OAuthError />} />
            <Route element={<ProtectedRoute />}> 
              <Route path="/planners" element={<PlannerListPage />} />
              <Route path="/planners/:id" element={<PlannerDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
