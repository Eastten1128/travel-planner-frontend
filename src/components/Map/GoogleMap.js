/**
 * Google Maps Embed API를 활용해 간단한 지도 iframe을 렌더링하는 컴포넌트.
 * 전달받은 검색어(query)와 모드(mapMode)에 맞춰 URL을 조합하고,
 * 반응형 크기와 둥근 테두리 스타일을 적용한다.
 */
import React from "react";

const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyCZnKHz4hMODXxY3bL-qbMIFM0BSjA14Yg";

// 환경 변수에 담긴 API 키가 제대로 로드됐는지 확인용 로그
console.log("loaded env key:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

const GoogleMap = ({
  mapMode = "place", // 검색/경로/뷰 등 원하는 맵 모드 (place, directions 등)
  query = "Seoul", // 지도에서 표시할 검색어 또는 좌표
  width = 560,
  height = 560,
}) => {
  const isPlaceholderKey = GOOGLE_MAPS_API_KEY === "AIzaSyCZnKHz4hMODXxY3bL-qbMIFM0BSjA14Yg";

  // Google Maps Embed용 URL 생성: q 파라미터로 검색어를 인코딩하여 전달
  const src = `https://www.google.com/maps/embed/v1/${mapMode}?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
    query
  )}`;

  // height가 숫자일 때는 px 단위 문자열로 변환해 iframe 스타일에 반영
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <iframe
      width={width}
      height={height}
      frameBorder="0"
      style={{
        width: "100%",
        maxWidth: "100%",
        height: resolvedHeight || "100%",
        minHeight: resolvedHeight || "100%",
        maxHeight: "100%",
        border: 0,
        borderRadius: 16,
        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.12)",
        overflow: "hidden",
        display: "block",
      }}
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
      allowFullScreen
      loading="lazy"
      title="Google Map"
    />
  );
};

export default GoogleMap;