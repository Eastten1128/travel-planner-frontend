import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../../components/layout/AppNavbar";
import AppFooter from "../../components/layout/AppFooter";
import PlannerForm from "../../components/planner/PlannerForm";
import plannerService from "../../services/plannerService";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatters";

const PlannerListPage = () => {
  const { tokens, user } = useAuth();
  const navigate = useNavigate();

  const [planners, setPlanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlanner, setEditingPlanner] = useState(null);

  const accessToken = tokens?.accessToken;

  const loadPlanners = useMemo(
    () => async () => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await plannerService.getPlanners(accessToken);
        setPlanners(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        console.error(err);
        setError("플래너 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    loadPlanners();
  }, [loadPlanners]);

  const handleCreate = () => {
    setEditingPlanner(null);
    setDialogOpen(true);
  };

  const handleEdit = (planner) => {
    setEditingPlanner(planner);
    setDialogOpen(true);
  };

  const handleSubmit = async (values) => {
    if (!accessToken) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: values.title,
        plannerTitle: values.title,
        startDate: values.startDate,
        endDate: values.endDate,
        plannerStartday: values.startDate,
        plannerEndday: values.endDate,
        memo: values.memo,
      };

      if (editingPlanner?.id || editingPlanner?.plannerNo) {
        const plannerId = editingPlanner.id || editingPlanner.plannerNo;
        await plannerService.updatePlanner(accessToken, plannerId, payload);
      } else {
        await plannerService.createPlanner(accessToken, payload);
      }

      setDialogOpen(false);
      setEditingPlanner(null);
      loadPlanners();
    } catch (err) {
      console.error(err);
      setError("플래너 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (planner) => {
    if (!accessToken) return;
    if (!window.confirm("해당 플래너를 삭제하시겠습니까?")) {
      return;
    }
    try {
      const plannerId = planner.id || planner.plannerNo;
      await plannerService.deletePlanner(accessToken, plannerId);
      loadPlanners();
    } catch (err) {
      console.error(err);
      setError("플래너 삭제에 실패했습니다.");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="outlined" onClick={loadPlanners}>
            다시 시도
          </Button>
        </Box>
      );
    }

    if (planners.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h6" gutterBottom>
            생성된 플래너가 없습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            첫 여행 일정을 등록해 보세요!
          </Typography>
          <Button variant="contained" onClick={handleCreate}>
            새 플래너 만들기
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {planners.map((planner) => {
          const plannerId = planner.id || planner.plannerNo;
          const title = planner.title || planner.plannerTitle;
          const startDay = planner.startDate || planner.plannerStartday;
          const endDay = planner.endDate || planner.plannerEndday;

          return (
            <Grid item xs={12} md={6} lg={4} key={plannerId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(startDay)} - {formatDate(endDay)}
                  </Typography>
                  {planner.memo && (
                    <Typography variant="body2" color="text.secondary" mt={2}>
                      {planner.memo}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Button onClick={() => navigate(`/planners/${plannerId}`)}>상세보기</Button>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={() => handleEdit(planner)}>
                      수정
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(planner)}>
                      삭제
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const dialogTitle = editingPlanner ? "플래너 수정" : "새 플래너";
  const dialogInitialValues = editingPlanner
    ? {
        title: editingPlanner.title || editingPlanner.plannerTitle || "",
        startDate: editingPlanner.startDate || editingPlanner.plannerStartday || "",
        endDate: editingPlanner.endDate || editingPlanner.plannerEndday || "",
        memo: editingPlanner.memo || "",
      }
    : undefined;

  return (
    <Box>
      <AppNavbar />
      <Container sx={{ py: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              내 여행 플래너
            </Typography>
            {user && (
              <Typography variant="body1" color="text.secondary">
                {user.name || user.nickname || user.email} 님의 일정 목록입니다.
              </Typography>
            )}
          </Box>
          <Button variant="contained" onClick={handleCreate}>
            새 플래너
          </Button>
        </Stack>
        {renderContent()}
      </Container>
      <AppFooter />

      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <PlannerForm
            initialValues={dialogInitialValues}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel={editingPlanner ? "수정" : "생성"}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PlannerListPage;
