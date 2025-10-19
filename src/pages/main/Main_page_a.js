import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import Navbar from "../../components/Navbar/afterLogin/Navbar_a";
import Footer from "../../components/Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const MainA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/main_a", { replace: true });
    } else {
      const savedToken = localStorage.getItem("accessToken");
      if (!savedToken) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      axios
        .get("http://localhost:8080/user/additionalInfo/check", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        })
        .then((res) => {
          const user = res.data;
          if (!user.name) {
            setOpenModal(true); 
          }
        })
        .catch((err) => {
          console.log("요청 시 보낸 토큰:", savedToken);
          console.error("유저 정보 요청 실패:", err);
          alert("로그인 정보가 유효하지 않습니다.");
          navigate("/login");
        });
    }
  }, [location, navigate]);

  const handleGoToAdditionalInfo = () => {
    setOpenModal(false);
    navigate("/additional-info");
  };

  return (
    <>
      <Navbar />
      <Container>
      </Container>
      <Footer />

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>추가 정보 입력 필요</DialogTitle>
        <DialogContent>
          <DialogContentText>
            처음 로그인하신 것 같아요! 닉네임 등 추가 정보를 입력해주세요.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>닫기</Button>
          <Button
            onClick={handleGoToAdditionalInfo}
            variant="contained"
            sx={{
              backgroundColor: "#d71f1c",
              "&:hover": {
                backgroundColor: "#b81a18",
              },
              color: "#fff",
            }}
          >
            입력하러 가기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MainA;
