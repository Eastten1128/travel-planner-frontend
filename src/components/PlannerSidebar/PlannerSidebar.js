import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
} from "@mui/material";

const PlannerSidebar = ({
  plannerTitle,
  onTitleChange,
  todayPlans,
  onRemove,
  onSave,
}) => {
  const handleChangeTitle = (event) => {
    onTitleChange(event.target.value);
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
        <TextField
          label="플래너 제목"
          value={plannerTitle}
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