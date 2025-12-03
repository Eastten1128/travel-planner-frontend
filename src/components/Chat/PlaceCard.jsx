import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";

export default function PlaceCard({ place }) {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 2, 
        background: "#ffffff",
        border: "1px solid #ececec",
        transition: "0.2s",
        "&:hover": { boxShadow: 4, transform: "scale(1.02)" }
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ color: "#d71f1c" }}>
          {place.name}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1, color: "#555" }}>
          {place.description}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mt: 1, color: "#777" }}>
          <PlaceIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">{place.address}</Typography>
        </Box>

        {place.reason && (
          <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#888" }}>
            💡 {place.reason}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
