import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const AdditionalInfo = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [preferredGenre, setPreferredGenre] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("요청 데이터:", { nickname, preferredGenre });

    try {
      await client.post("/auth/additional-info", {
        nickname,
        preferredGenre,
      });
      navigate("/main/plan");
    } catch (error) {
      console.error("추가 정보 등록 실패:", error);
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }
      alert("추가 정보 등록에 실패했습니다.");
    }
  };

  return (
    <>
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 8,
          p: 4,
          bgcolor: "#1e1e1e", // 어두운 배경
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" gutterBottom align="center" sx={{ color: "white" }}>
          추가 정보 입력
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="닉네임"
            fullWidth
            margin="normal"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{ style: { color: "white" } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: 'white' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
            }}
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#d71f1c",
              color: "white",
              "&:hover": {
                backgroundColor: "#b81a18",
              },
            }}
          >
            제출
          </Button>
        </form>
      </Box>
    </>
  );
  
};

export default AdditionalInfo;
