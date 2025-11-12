import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  Avatar,
} from "@mui/material";

const PlannerSidebar = ({
  title,
  onTitleChange,
  todayPlans,
  onSelectSidebarItem,
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
          value={title}
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
            {todayPlans.map((plan) => {
              const titleText = plan.placeName || plan.title || "이름 없는 일정";
              const addressText = plan.addr || plan.address || "";
              return (
                <Paper
                  key={plan.id ?? titleText}
                  variant="outlined"
                  onClick={() => onSelectSidebarItem && onSelectSidebarItem(plan)}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(58, 141, 151, 0.08)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                    {(plan.imageUrl || plan.image) && (
                      <Avatar
                        src={plan.imageUrl || plan.image}
                        alt={titleText}
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
                        {titleText}
                      </Typography>
                      {addressText && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {addressText}
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
                      onRemove(plan.id);
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
