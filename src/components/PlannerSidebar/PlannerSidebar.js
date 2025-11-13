
import React, {useEffect, useState} from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import client from "../../api/client";


const PlannerSidebar = ({
  plannerTitle,
  onTitleChange,
  todayPlans,
  onRemove,
  onSave,
}) => {

  const [userPlannerTitle, setUserPlannerTitle] = useState(plannerTitle ?? "");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);

  useEffect(() => {
    if (plannerTitle === undefined) {
      return;
    }

    setUserPlannerTitle((prev) => {
      const nextTitle = plannerTitle ?? "";
      return prev === nextTitle ? prev : nextTitle;
    });
  }, [plannerTitle]);

  useEffect(() => {
    let isMounted = true;

    const resolveFirstPlannerTitle = (data) => {
      if (!data) {
        return "";
      }

      if (Array.isArray(data) && data.length > 0) {
        return (
          data[0]?.plannerTitle ||
          data[0]?.title ||
          ""
        );
      }

      if (Array.isArray(data?.content) && data.content.length > 0) {
        return (
          data.content[0]?.plannerTitle ||
          data.content[0]?.title ||
          ""
        );
      }

      if (Array.isArray(data?.data) && data.data.length > 0) {
        return (
          data.data[0]?.plannerTitle ||
          data.data[0]?.title ||
          ""
        );
      }

      if (typeof data === "object") {
        return data.plannerTitle || data.title || "";
      }

      return "";
    };

    const fetchPlannerTitle = async () => {
      if (plannerTitle) {
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      setIsFetchingTitle(true);

      try {
        const userResponse = await client.get("/user/additionalInfo/check");
        const userData = userResponse?.data ?? {};
        const resolvedUserId =
          userData?.userId ??
          userData?.id ??
          userData?.userid ??
          userData?.userNo ??
          null;

        const plannerResponse = await client.get("/api/planners", {
          params:
            resolvedUserId !== null && resolvedUserId !== undefined
              ? { userId: resolvedUserId }
              : undefined,
        });

        const fetchedTitle = resolveFirstPlannerTitle(plannerResponse?.data);

        if (!isMounted || !fetchedTitle) {
          return;
        }

        setUserPlannerTitle(fetchedTitle);
        if (typeof onTitleChange === "function" && plannerTitle !== fetchedTitle) {
          onTitleChange(fetchedTitle);
        }
      } catch (error) {
        if (isMounted) {
          console.error("사용자 플래너 제목을 불러오지 못했습니다:", error);
        }
      } finally {
        if (isMounted) {
          setIsFetchingTitle(false);
        }
      }
    };

    fetchPlannerTitle();

    return () => {
      isMounted = false;
    };
  }, [plannerTitle, onTitleChange]);

  const handleChangeTitle = (event) => {
    const { value } = event.target;
    setUserPlannerTitle(value);
    if (typeof onTitleChange === "function") {
      onTitleChange(value);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 320,
        p: 3,
        bgcolor: "#d0f0ff",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <h2 className="text-2xl font-semibold text-gray-900">
  {userPlannerTitle || "플래너 제목"}
</h2>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            backgroundColor: "#3a8d97",
            "&:hover": { backgroundColor: "#2e7078" },
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          저장
        </Button>
      </Stack>

      <Divider />

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          오늘의 일정
        </Typography>
        {todayPlans.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            추가한 일정이 없습니다. 검색 결과에서 "추가" 버튼을 눌러 일정을
            등록하세요.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {todayPlans.map((plan) => (
              <Paper
                key={plan.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {plan.title}
                  </Typography>
                  {plan.address && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {plan.address}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => onRemove(plan.id)}
                >
                  삭제
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default PlannerSidebar;