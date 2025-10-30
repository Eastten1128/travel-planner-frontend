import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";

const defaultValues = {
  type: "SCHEDULE",
  date: "",
  memo: "",
  budget: "",
};

const TODAY_PLAN_TYPES = [
  { value: "SCHEDULE", label: "일정" },
  { value: "ACCOMMODATION", label: "숙소" },
  { value: "FOOD", label: "식사" },
  { value: "TRANSPORT", label: "이동" },
  { value: "ETC", label: "기타" },
];

const TodayPlanForm = ({ initialValues, onSubmit, onCancel, submitLabel = "저장", isSubmitting = false }) => {
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
    onSubmit?.({
      ...values,
      budget: values.budget === "" ? null : Number(values.budget),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          select
          label="유형"
          name="type"
          value={values.type}
          onChange={handleChange}
          required
        >
          {TODAY_PLAN_TYPES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="일자"
          name="date"
          type="date"
          value={values.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="메모"
          name="memo"
          value={values.memo}
          onChange={handleChange}
          multiline
          minRows={2}
        />
        <TextField
          label="예산"
          name="budget"
          type="number"
          value={values.budget}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 0, step: 1000 } }}
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

export default TodayPlanForm;
