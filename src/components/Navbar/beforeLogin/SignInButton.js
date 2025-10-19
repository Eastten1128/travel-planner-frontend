import { Button } from "@mui/material";

const SignInButton = () => {
  const handleLoginClick = () => {
    // Spring Security가 제공하는 Google OAuth2 로그인 URL
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
    //window.location.href = "http://localhost:8080/api/auth/google";
  };

  return (
    <Button
      variant="contained"
      onClick={handleLoginClick}
      sx={{
        backgroundColor: "#d71f1c",
        color: "white",
        "&:hover": {
          backgroundColor: "#b81a18",
        },
      }}
    >
      Google로 로그인
    </Button>
  );
};

export default SignInButton;
