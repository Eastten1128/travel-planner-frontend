// 검색 패널 컴포넌트 - 관광지 검색 및 일정 추가
import React, { useState } from "react";
import axios from "axios";

function SearchComponent({ onAddPlan }) {
  const [keyword, setKeyword] = useState("");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!keyword.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }

    setLoading(true);

    axios
      .get("https://sw6885travelplannerfin.uk/api/tours/search", {
        params: {
          keyword: keyword,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const items = response.data?.response?.body?.items?.item || [];
        setTours(Array.isArray(items) ? items : [items]);
      })
      .catch((error) => {
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
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-3">
        <input
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          placeholder="관광지명을 입력하세요..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          type="button"
          className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          onClick={handleSearch}
          disabled={loading}
        >
          검색
        </button>
      </div>

      {loading && (
        <div className="mt-4 flex justify-center">
          <span className="text-sm text-gray-500">검색 중입니다...</span>
        </div>
      )}

      {!loading && tours.length === 0 && (
        <p className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
          검색 결과가 없습니다.
        </p>
      )}

      {!loading && tours.length > 0 && (
        <div className="mt-4 space-y-3">
          {tours.map((tour) => (
            <div
              key={tour.contentid}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-3 shadow-sm"
            >
              {tour.firstimage ? (
                <img
                  src={tour.firstimage}
                  alt={tour.title}
                  className="h-24 w-32 flex-shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xs text-gray-500">
                  이미지 없음
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="truncate text-base font-semibold text-gray-900">{tour.title}</h3>
                <p className="truncate text-sm text-gray-600">
                  <strong className="mr-1">위치:</strong>
                  {tour.addr1}
                </p>
                {tour.addr2 && <p className="truncate text-xs text-gray-500">{tour.addr2}</p>}
              </div>
              <button
                type="button"
                className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                onClick={() => handleAddPlan(tour)}
              >
                추가
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SearchComponent;
