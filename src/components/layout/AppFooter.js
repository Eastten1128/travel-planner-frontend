import { Box, Typography } from "@mui/material";

const AppFooter = () => (
  <Box component="footer" sx={{ py: 4, textAlign: "center", bgcolor: "#f5f5f5", mt: 6 }}>
    <Typography variant="body2" color="text.secondary">
      © {new Date().getFullYear()} Travel Planner. All rights reserved.
    </Typography>
  </Box>
);

export default AppFooter;
