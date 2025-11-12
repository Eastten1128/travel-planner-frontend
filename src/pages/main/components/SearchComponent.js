import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
} from '@mui/material';

function SearchComponent({ onAddPlan }) {
  const [keyword, setKeyword] = useState('');
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!keyword.trim()) {
      alert('검색어를 입력하세요.');
      return;
    }

    setLoading(true);

    axios.get('http://localhost:8080/api/tours/search', {
      params: {
        keyword: keyword
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      const items = response.data?.response?.body?.items?.item || [];
      setTours(Array.isArray(items) ? items : [items]);
    })
    .catch(error => {
      console.error("검색 중 오류 발생:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
      } else {
        alert("검색 중 오류가 발생했습니다.");
      }
      setTours([]);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddPlan = (tour) => {
    if (!onAddPlan) {
      return;
    }

    const address = tour.addr1 || tour.addr2 || '';

    const todayPlan = {
      id: tour.contentid,
      placeName: tour.title,
      title: tour.title,
      addr: address,
      address,
      imageUrl: tour.firstimage,
      image: tour.firstimage,
      mapX: tour.mapx,
      mapY: tour.mapy,
    };

    onAddPlan(todayPlan);
  };

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TextField
          label="관광지명을 입력하세요..."
          variant="outlined"
          fullWidth
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{
            backgroundColor: "#d71f1c",
            '&:hover': {
              backgroundColor: "#b81a18",
            },
            color: "#fff",
            padding: "15px 20px"
          }}
        >
          검색
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && tours.length === 0 && (
        <Typography align="center" sx={{ mt: 3, color: 'text.secondary' }}>
          검색 결과가 없습니다.
        </Typography>
      )}

      {!loading && tours.length > 0 && (
        <Box>
          {tours.map((tour) => (
            <Paper
              key={tour.contentid}
              elevation={2}
              sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Avatar
                src={tour.firstimage}
                alt={tour.title}
                variant="rounded"
                sx={{
                  width: 150,
                  height: 100,
                  mr: 2,
                  bgcolor: '#eee',
                  fontSize: '0.8rem'
                }}
              >
                (이미지 없음)
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  {tour.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>위치:</strong> {tour.addr1}
                </Typography>
                {tour.addr2 && (
                  <Typography variant="body2" color="text.secondary">
                    {tour.addr2}
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#d71f1c',
                  '&:hover': {
                    backgroundColor: '#b81a18',
                  },
                  color: '#fff',
                  ml: 2,
                  flexShrink: 0,
                }}
                onClick={() => handleAddPlan(tour)}
              >
                추가
              </Button>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default SearchComponent;
