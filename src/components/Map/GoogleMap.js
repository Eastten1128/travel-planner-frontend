// 구글 맵 임베드 컴포넌트 - 메인 지도 영역을 채운다
import React from "react";

const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyCZnKHz4hMODXxY3bL-qbMIFM0BSjA14Yg";

const GoogleMap = ({
  mapMode = "place",
  query = "Seoul",
  width = "100%",
  height = "100%",
}) => {
  const src = `https://www.google.com/maps/embed/v1/${mapMode}?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
    query
  )}`;

  return (
    <iframe
      width={width}
      height={height}
      frameBorder="0"
      className="h-full w-full border-0"
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
      allowFullScreen
      loading="lazy"
      title="Google Map"
    />
  );
};

export default GoogleMap;
