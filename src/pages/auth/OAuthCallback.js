import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import useAuth from "../../hooks/useAuth";

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken") || params.get("token");
    const refreshToken = params.get("refreshToken");
    const isProfileIncomplete = params.get("isProfileIncomplete") === "true";

    if (!accessToken) {
      navigate("/oauth2/error", { replace: true, state: { reason: "토큰 정보가 없습니다." } });
      return;
    }

    const tokens = { accessToken, refreshToken };

    login(tokens)
      .then(() => {
        navigate(isProfileIncomplete ? "/planners" : "/planners", { replace: true });
      })
      .catch(() => {
        navigate("/oauth2/error", { replace: true, state: { reason: "사용자 정보를 불러오지 못했습니다." } });
      });
  }, [location.search, login, navigate]);

  return (
    <Container sx={{ py: 10, textAlign: "center" }}>
      <Box>
        <CircularProgress />
        <Typography variant="h6" mt={3}>
          로그인 중입니다. 잠시만 기다려주세요…
        </Typography>
      </Box>
    </Container>
  );
};

export default OAuthCallback;
