import { useEffect, useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";

const defaultValues = {
  title: "",
  startDate: "",
  endDate: "",
  memo: "",
};

const PlannerForm = ({ initialValues, onSubmit, onCancel, submitLabel = "저장", isSubmitting = false }) => {
  const [values, setValues] = useState({ ...defaultValues, ...initialValues });

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="플래너 제목"
          name="title"
          value={values.title}
          onChange={handleChange}
          required
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="여행 시작일"
            name="startDate"
            type="date"
            value={values.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <TextField
            label="여행 종료일"
            name="endDate"
            type="date"
            value={values.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
        </Stack>
        <TextField
          label="메모"
          name="memo"
          value={values.memo}
          onChange={handleChange}
          multiline
          minRows={3}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
              취소
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PlannerForm;
