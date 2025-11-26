import React from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyCZnKHz4hMODXxY3bL-qbMIFM0BSjA14Yg";

const GoogleMap = ({
  mapMode = "place",
  query = "Seoul",
  width = "100%",
  height = 250,
}) => {
  const src = `https://www.google.com/maps/embed/v1/${mapMode}?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
    query
  )}`;

  return (
    <iframe
      width={width}
      height={height}
      frameBorder="0"
      style={{ border: 0, borderRadius: 8 }}
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
      allowFullScreen
      loading="lazy"
      title="Google Map"
    />
  );
};

export default GoogleMap;
