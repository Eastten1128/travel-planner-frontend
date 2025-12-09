// 구글 맵 임베드 컴포넌트 - 메인 지도 영역을 채운다
import React, { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyCZnKHz4hMODXxY3bL-qbMIFM0BSjA14Yg";

let googleMapsScriptPromise = null;

const loadGoogleMapsScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps SDK 로드 실패"));
      }
    };

    script.onerror = () => reject(new Error("Google Maps SDK 스크립트 로드 오류"));

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
};

const defaultCenter = { lat: 37.5665, lng: 126.978 }; // 서울 시청 기준

const GoogleMap = ({
  query = "Seoul",
  width = "100%",
  height = "100%",
  routeRequest = null,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadGoogleMapsScript()
      .then(() => {
        if (!mounted) return;
        setMapsLoaded(true);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapsLoaded || mapInstanceRef.current || !mapContainerRef.current) {
      return;
    }

    mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
    });

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
    directionsRendererRef.current.setMap(mapInstanceRef.current);
  }, [mapsLoaded]);

  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !routeRequest) {
      if (mapsLoaded && directionsRendererRef.current) {
        directionsRendererRef.current.set("directions", null);
      }
      return;
    }

    const { origin, destination, waypoints = [], travelMode = "DRIVING" } = routeRequest;

    const directionsService = new window.google.maps.DirectionsService();

    const normalizedTravelMode =
      window.google.maps.TravelMode[travelMode?.toUpperCase()] ||
      window.google.maps.TravelMode.DRIVING;

    // routeRequest를 기반으로 Google Maps Directions API를 호출하여 지도 위에 경로를 그리는 효과
    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: normalizedTravelMode,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === "OK" && result) {
          directionsRendererRef.current?.setDirections(result);
          if (origin) {
            mapInstanceRef.current?.setCenter(origin);
          }
        } else {
          console.error("Directions request failed:", status, result);
        }
      }
    );
  }, [mapsLoaded, routeRequest]);

  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !query || routeRequest) {
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
      if (status === "OK" && results[0]) {
        mapInstanceRef.current?.setCenter(results[0].geometry.location);
        mapInstanceRef.current?.setZoom(13);
      }
    });
  }, [mapsLoaded, query, routeRequest]);

  useEffect(
    () => () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    },
    []
  );

  return (
    <div
      ref={mapContainerRef}
      style={{ width, height }}
      className="h-full w-full"
    />
  );
};

export default GoogleMap;
