// src/pages/MainA.js (또는 MainA.js 파일 경로)

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

// [수정 1] SearchComponent 임포트하기
// (위에서 생성한 SearchComponent.js 파일의 실제 경로에 맞게 수정하세요)
import SearchComponent from "../../components/Search/SearchComponent";
import PlannerSidebar from "../../components/PlannerSidebar/PlannerSidebar";

const MainA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [plannerTitle, setPlannerTitle] = useState("");
  const [todayPlans, setTodayPlans] = useState([]);

  // ... (useEffect 및 나머지 로직은 그대로) ...
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

    const handleAddPlan = (plan) => {
    setTodayPlans((prev) => {
      const exists = prev.some((item) => item.id === plan.id);
      if (exists) {
        return prev;
      }
      return [...prev, plan];
    });
  };

  const handleRemovePlan = (planId) => {
    setTodayPlans((prev) => prev.filter((plan) => plan.id !== planId));
  };

  const handleSavePlanner = async () => {
    if (!plannerTitle.trim()) {
      alert("플래너 제목을 입력해주세요.");
      return;
    }

    if (todayPlans.length === 0) {
      alert("저장할 일정이 없습니다.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/planners",
        {
          title: plannerTitle,
          todayPlans,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("플래너가 저장되었습니다.");
    } catch (error) {
      console.error("플래너 저장 중 오류:", error);
      alert("플래너 저장에 실패했습니다.");
    }
  };
  // ... (여기까지 로직 동일) ...

  return (
    <>
      <Navbar />
      <Container>
               <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start", my: 4 }}>
          <PlannerSidebar
            plannerTitle={plannerTitle}
            onTitleChange={setPlannerTitle}
            todayPlans={todayPlans}
            onRemove={handleRemovePlan}
            onSave={handleSavePlanner}
          />
          <Box sx={{ flex: 1 }}>
            <SearchComponent onAddPlan={handleAddPlan} />
          </Box>
        </Box>
      </Container>
      <Footer />

      {/* ... (Dialog 관련 코드는 그대로) ... */}
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