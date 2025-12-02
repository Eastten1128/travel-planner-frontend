/**
 * TourAPI 검색 결과를 보여주고, 선택한 관광지를 오늘의 일정 초안으로 추가하는 컴포넌트.
 * 키워드 기반 검색을 수행하며 인증 토큰이 없으면 로그인 요청을 안내한다.
 */
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

function SearchComponent({ onAddPlan}) {
  const [keyword, setKeyword] = useState(''); // 검색어 입력 필드 상태
  const [tours, setTours] = useState([]); // 검색 결과 목록
  const [loading, setLoading] = useState(false); // 검색 요청 진행 여부

  // 검색 버튼 클릭 또는 Enter 입력 시 호출: 인증 토큰 확인 후 백엔드 검색 API 요청
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

  // 입력창에서 Enter 키를 누르면 handleSearch 실행
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 특정 검색 결과를 플래너 초안에 추가할 때 TodayPlan 형태로 변환
  const handleAddPlan = (tour) => {
    if (!onAddPlan) {
      return;
    }

    const contentId = tour.contentid ?? tour.contentId ?? null;
    const contentTypeId = tour.contenttypeid ?? tour.contentTypeId ?? null;

    const todayPlan = {
      id: contentId ?? tour.id ?? tour.placeId ?? tour.placeNo,
      contentId,
      contentTypeId,
      title: tour.title,
      address: tour.addr1,
      image: tour.firstimage,
      mapX: tour.mapx,
      mapY: tour.mapy,
    };

    onAddPlan(todayPlan);
  };

  // 검색 UI와 결과 리스트 렌더링
  return (
    <Box sx={{ my: 4 }}> {/* 전체 컴포넌트 여백 */}
      {/* 검색창: 텍스트 입력과 검색 버튼을 가로로 배치 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TextField
          label="관광지명을 입력하세요..."
          variant="outlined"
          fullWidth
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ mr: 1 }} // 버튼과의 오른쪽 마진
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading} // 로딩 중 비활성화
          sx={{
            backgroundColor: "#d71f1c",
            "&:hover": {
              backgroundColor: "#b81a18",
            },
            color: "#fff",
            padding: "15px 20px" // TextField 높이에 맞게 조절
          }}
        >
          검색
        </Button>
      </Box>

      {/* 로딩 중 표시: MUI CircularProgress 사용 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 검색 결과 목록 (데이터 없음) */}
      {!loading && tours.length === 0 && (
        <Typography align="center" sx={{ mt: 3, color: 'text.secondary' }}>
          검색 결과가 없습니다.
        </Typography>
      )}

      {/* 검색 결과 목록 (데이터 있음) */}
      {!loading && tours.length > 0 && (
        <Box>
          {tours.map((tour) => (
            // Paper 컴포넌트를 사용해 각 항목에 테두리와 그림자 효과
            <Paper
              key={tour.contentid}
              elevation={2} // 그림자 효과
              sx={{
                p: 2,           // 내부 여백
                mb: 2,          // 항목 간 마진
                display: 'flex',// 이미지와 텍스트를 가로로 배치
                alignItems: 'center'
              }}
            >
              {/* 1. 이미지: Avatar 컴포넌트 사용 (이미지 없으면 플레이스홀더) */}
              <Avatar
                src={tour.firstimage}
                alt={tour.title}
                variant="rounded" // 사각 이미지 (rounded)
                sx={{
                  width: 150,
                  height: 100,
                  mr: 2,
                  bgcolor: '#eee', // 이미지 없을 때 배경색
                  fontSize: '0.8rem' // 이미지 없을 때 텍스트 크기
                }}
              >
                (이미지 없음)
              </Avatar>

              {/* 2. 텍스트 정보 (이름, 위치 등) */}
              <Box sx={{flex: 1, minWidth: 0 }}>
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