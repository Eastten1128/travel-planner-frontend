import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AppNavbar from "../../components/layout/AppNavbar";
import AppFooter from "../../components/layout/AppFooter";
import plannerService from "../../services/plannerService";
import useAuth from "../../hooks/useAuth";
import TodayPlanForm from "../../components/planner/TodayPlanForm";
import { formatCurrency, formatDate } from "../../utils/formatters";

const PlannerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokens } = useAuth();

  const [planner, setPlanner] = useState(null);
  const [todayPlans, setTodayPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const accessToken = tokens?.accessToken;

  const loadData = useMemo(
    () => async () => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        const [plannerData, todayPlanData] = await Promise.all([
          plannerService.getPlanner(accessToken, id),
          plannerService.getTodayPlans(accessToken, id),
        ]);
        setPlanner(plannerData);
        setTodayPlans(Array.isArray(todayPlanData) ? todayPlanData : todayPlanData?.content || []);
      } catch (err) {
        console.error(err);
        setError("플래너 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, id]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handlePlanSubmit = async (values) => {
    if (!accessToken) return;
    setIsSubmitting(true);
    try {
      const payload = {
        type: values.type,
        todayType: values.type,
        date: values.date,
        todayDate: values.date,
        memo: values.memo,
        budget: values.budget,
      };

      if (editingPlan?.id || editingPlan?.todayNo) {
        const todayPlanId = editingPlan.id || editingPlan.todayNo;
        await plannerService.updateTodayPlan(accessToken, todayPlanId, payload);
      } else {
        await plannerService.createTodayPlan(accessToken, id, payload);
      }

      setDialogOpen(false);
      setEditingPlan(null);
      loadData();
    } catch (err) {
      console.error(err);
      setError("일정을 저장하는 데 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (plan) => {
    if (!accessToken) return;
    if (!window.confirm("해당 일정을 삭제하시겠습니까?")) {
      return;
    }
    try {
      const todayPlanId = plan.id || plan.todayNo;
      await plannerService.deleteTodayPlan(accessToken, todayPlanId);
      loadData();
    } catch (err) {
      console.error(err);
      setError("일정을 삭제하는 데 실패했습니다.");
    }
  };

  const renderBody = () => {
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
          <Button variant="outlined" onClick={loadData}>
            다시 시도
          </Button>
        </Box>
      );
    }

    if (!planner) {
      return (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography>플래너 정보를 찾을 수 없습니다.</Typography>
        </Box>
      );
    }

    const title = planner.title || planner.plannerTitle;
    const startDay = planner.startDate || planner.plannerStartday;
    const endDay = planner.endDate || planner.plannerEndday;

    return (
      <Stack spacing={4}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatDate(startDay)} - {formatDate(endDay)}
                </Typography>
                {planner.memo && (
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    {planner.memo}
                  </Typography>
                )}
              </Box>
              <Button variant="contained" onClick={handleCreatePlan}>
                일정 추가
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              TodayPlan 목록
            </Typography>
            {todayPlans.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                등록된 일정이 없습니다.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>일자</TableCell>
                    <TableCell>유형</TableCell>
                    <TableCell>메모</TableCell>
                    <TableCell align="right">예산</TableCell>
                    <TableCell align="right">액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayPlans.map((plan) => (
                    <TableRow key={plan.id || plan.todayNo}>
                      <TableCell>{formatDate(plan.date || plan.todayDate)}</TableCell>
                      <TableCell>{plan.type || plan.todayType}</TableCell>
                      <TableCell>{plan.memo}</TableCell>
                      <TableCell align="right">{formatCurrency(plan.budget)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" onClick={() => handleEditPlan(plan)}>
                            수정
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => handleDeletePlan(plan)}>
                            삭제
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Stack>
    );
  };

  const dialogInitialValues = editingPlan
    ? {
        type: editingPlan.type || editingPlan.todayType || "SCHEDULE",
        date: editingPlan.date || editingPlan.todayDate || "",
        memo: editingPlan.memo || "",
        budget: editingPlan.budget ?? "",
      }
    : undefined;

  return (
    <Box>
      <AppNavbar />
      <Container sx={{ py: 6 }}>
        <Button sx={{ mb: 3 }} onClick={() => navigate(-1)}>
          목록으로
        </Button>
        {renderBody()}
      </Container>
      <AppFooter />

      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingPlan ? "일정 수정" : "새 일정 추가"}</DialogTitle>
        <DialogContent>
          <TodayPlanForm
            initialValues={dialogInitialValues}
            onSubmit={handlePlanSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel={editingPlan ? "수정" : "추가"}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PlannerDetailPage;
