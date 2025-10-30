import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const AppNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogin = () => {
    const oauthUrl = process.env.REACT_APP_GOOGLE_OAUTH_URL || "http://localhost:8080/oauth2/authorization/google";
    window.location.href = oauthUrl;
  };

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to={isAuthenticated ? "/planners" : "/"}
          sx={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
        >
          Travel Planner
        </Typography>

        {isAuthenticated ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
              {user?.name || user?.nickname || "사용자"}
            </Typography>
            <Typography variant="body2" sx={{ display: { xs: "none", md: "block" } }}>
              {user?.email}
            </Typography>
            <Button color="inherit" onClick={logout}>
              로그아웃
            </Button>
          </Stack>
        ) : (
          <Button color="inherit" onClick={handleLogin}>
            Google로 로그인
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppNavbar;
