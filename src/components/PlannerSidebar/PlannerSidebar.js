import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
} from "@mui/material";

const PlannerSidebar = ({
  plannerTitle = "",
  onTitleChange,
  todayPlans = [],
  onSelectPlan,
  selectedPlanId,
  onRemove,
  onSave,
}) => {
  const [titleInput, setTitleInput] = useState(plannerTitle ?? "");

  useEffect(() => {
    setTitleInput(plannerTitle ?? "");
  }, [plannerTitle]);

  const handleChangeTitle = (event) => {
    const nextValue = event.target.value;
    setTitleInput(nextValue);
    if (typeof onTitleChange === "function") {
      onTitleChange(nextValue);
    }
  };

  const resolvePlanId = (plan) =>
    plan?.todayPlanNo ??
    plan?.todayPlanId ??
    plan?.id ??
    plan?.contentId ??
    plan?.contentid ??
    plan?.placeId ??
    plan?.placeNo ??
    plan?.clientGeneratedId ??
    null;

  const normalizedPlans = useMemo(
    () =>
      todayPlans.map((plan) => {
        const planId = resolvePlanId(plan);
        const titleText = plan?.placeName || plan?.title || "이름 없는 일정";
        const addressText = plan?.addr || plan?.address || "";
        return {
          ...plan,
          __display: {
            id: planId,
            title: titleText,
            address: addressText,
            image: plan?.imageUrl || plan?.image || plan?.thumbnail,
          },
        };
      }),
    [todayPlans]
  );

  const handleRemovePlan = (plan) => {
    const planId = resolvePlanId(plan);
    if (typeof onRemove === "function") {
      onRemove(planId, plan);
    }
  };

  const handleSelectPlan = (plan) => {
    if (typeof onSelectPlan !== "function") {
      return;
    }

    onSelectPlan(plan);
  };

  const isPlanSelected = (planId) => {
    if (selectedPlanId === undefined || selectedPlanId === null) {
      return false;
    }

    return selectedPlanId === planId;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 340,
        p: 3,
        bgcolor: "#d0f0ff",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          label="플래너 제목"
          value={titleInput}
          onChange={handleChangeTitle}
          size="small"
          fullWidth
        />
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
        {normalizedPlans.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            추가한 일정이 없습니다. 검색 결과에서 "추가" 버튼을 눌러 일정을
            등록하세요.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {normalizedPlans.map((plan) => {
              const planId = plan.__display.id;
              const isSelected = isPlanSelected(planId);
              return (
                <Paper
                  key={planId ?? plan.__display.title}
                  variant={isSelected ? "elevation" : "outlined"}
                  elevation={isSelected ? 6 : 0}
                  onClick={() => handleSelectPlan(plan)}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    cursor: "pointer",
                    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                    bgcolor: isSelected ? "rgba(58, 141, 151, 0.16)" : "inherit",
                    borderColor: isSelected ? "#3a8d97" : undefined,
                    "&:hover": {
                      bgcolor: "rgba(58, 141, 151, 0.08)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                    {plan.__display.image && (
                      <Avatar
                        src={plan.__display.image}
                        alt={plan.__display.title}
                        variant="rounded"
                        sx={{ width: 48, height: 48 }}
                      />
                    )}
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
                        {plan.__display.title}
                      </Typography>
                      {plan.__display.address && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {plan.__display.address}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemovePlan(plan);
                    }}
                  >
                    삭제
                  </Button>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default PlannerSidebar;