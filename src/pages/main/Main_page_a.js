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
import SearchComponent from "./components/SearchComponent";
import PlannerSidebar from "./components/PlannerSidebar";
import TodayPlanDetailComponent from "./components/TodayPlanDetailComponent";

const MainA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [plannerTitle, setPlannerTitle] = useState("");
  const [todayPlans, setTodayPlans] = useState([]);
  const [selectedSidebarItem, setSelectedSidebarItem] = useState(null);

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

  const handleAddPlanFromSearch = (plan) => {
    setTodayPlans((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === plan.id);
      if (existingIndex !== -1) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...plan };
        return next;
      }
      return [...prev, plan];
    });
    setSelectedSidebarItem(plan);
  };

  const handleRemovePlan = (planId) => {
    setTodayPlans((prev) => prev.filter((plan) => plan.id !== planId));
    setSelectedSidebarItem((prev) => (prev && prev.id === planId ? null : prev));
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

  const handleSaveTodayPlanDetail = async (payload) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/api/todayPlans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        alert("저장 실패: " + message);
        return;
      }

      const created = await response.json();
      const merged = {
        ...selectedSidebarItem,
        ...created,
      };
      if (!merged.id) {
        merged.id = created.id ?? selectedSidebarItem?.id ?? Date.now();
      }
      if (!merged.placeName) {
        merged.placeName = payload.placeName;
      }
      if (!merged.addr && selectedSidebarItem?.addr) {
        merged.addr = selectedSidebarItem.addr;
      }
      setTodayPlans((prev) => {
        const existingIndex = prev.findIndex((plan) => plan.id === merged.id);
        if (existingIndex !== -1) {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], ...merged };
          return next;
        }
        return [...prev, merged];
      });
      setSelectedSidebarItem(null);
      alert("오늘의 일정이 저장되었습니다.");
    } catch (error) {
      console.error("오늘의 일정 저장 실패:", error);
      alert("저장 실패: " + error.message);
    }
  };

  return (
    <>
      <Navbar />
      <Container>
        <Typography variant="h4" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>
          여행 플래너 만들기
        </Typography>
        <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start", my: 4 }}>
          <PlannerSidebar
            title={plannerTitle}
            onTitleChange={setPlannerTitle}
            todayPlans={todayPlans}
            onSelectSidebarItem={setSelectedSidebarItem}
            onRemove={handleRemovePlan}
            onSave={handleSavePlanner}
          />
          <Box sx={{ flex: 1 }}>
            <SearchComponent onAddPlan={handleAddPlanFromSearch} />
          </Box>
          {selectedSidebarItem && (
            <TodayPlanDetailComponent
              place={selectedSidebarItem}
              onCancel={() => setSelectedSidebarItem(null)}
              onSave={handleSaveTodayPlanDetail}
            />
          )}
        </Box>
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
