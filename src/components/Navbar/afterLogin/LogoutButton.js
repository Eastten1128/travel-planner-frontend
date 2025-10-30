import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const LogOutButton = () => {
  const navigate = useNavigate();

  const handleLogOutClick = () => {
    localStorage.removeItem("accessToken");
    navigate("/main_b");
  };

  return (
    <Button
      variant="contained"
      onClick={handleLogOutClick}
      sx={{
        backgroundColor: "#d71f1c",
        color: "white",
        "&:hover": {
          backgroundColor: "#b81a18",
        },
      }}
    >
      로그아웃
    </Button>
  );
};

export default LogOutButton;
