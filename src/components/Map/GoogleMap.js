import React from "react";

const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyCZnKHz4hMODXxY3bL-qbMIFM0BSjA14Yg";

console.log("loaded env key:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

const GoogleMap = ({
  mapMode = "place",
  query = "Seoul",
  width = 560,
  height = 560,
}) => {
  const isPlaceholderKey = GOOGLE_MAPS_API_KEY === "AIzaSyCZnKHz4hMODXxY3bL-qbMIFM0BSjA14Yg";

  const src = `https://www.google.com/maps/embed/v1/${mapMode}?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
    query
  )}`;

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