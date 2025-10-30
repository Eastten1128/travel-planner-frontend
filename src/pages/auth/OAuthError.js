import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import AppNavbar from "../../components/layout/AppNavbar";

const OAuthError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = location.state?.reason || "로그인 과정에서 오류가 발생했습니다.";

  const handleRetry = () => {
    navigate("/", { replace: true });
  };

  return (
    <Box>
      <AppNavbar />
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          로그인 실패
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {reason}
        </Typography>
        <Button variant="contained" onClick={handleRetry}>
          다시 시도하기
        </Button>
      </Container>
    </Box>
  );
};

export default OAuthError;
