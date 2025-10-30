import { Box, Button, Container, Grid, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import AppFooter from "../../components/layout/AppFooter";
import AppNavbar from "../../components/layout/AppNavbar";

const LandingPage = () => {
  const handleStart = () => {
    const oauthUrl = process.env.REACT_APP_GOOGLE_OAUTH_URL || "http://localhost:8080/oauth2/authorization/google";
    window.location.href = oauthUrl;
  };

  return (
    <Box>
      <AppNavbar />
      <Box sx={{ bgcolor: "#f0f4ff", py: 10 }}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
                AI와 함께하는 여행 플래너
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Google OAuth 2.0으로 간편하게 로그인하고, 여행 일정과 예산을 한 곳에서 관리하세요. 팀원을 초대하여 함께 계획을 세우고, AI 추천으로 더 풍성한 여행을 경험해보세요.
              </Typography>
              <Button variant="contained" size="large" onClick={handleStart}>
                Google 로그인으로 시작하기
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: "white", p: 4, borderRadius: 4, boxShadow: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  지금 가능한 기능
                </Typography>
                <List>
                  {["Google OAuth 로그인", "여행 플래너 생성/수정/삭제", "TodayPlan 일정 상세 관리"].map((item) => (
                    <ListItem key={item}>
                      <ListItemIcon sx={{ minWidth: 32 }}><Typography component="span">•</Typography></ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <AppFooter />
    </Box>
  );
};

export default LandingPage;
