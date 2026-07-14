import React, { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]);
  return null;
}

export function MapBoundsListener({ setBounds }: { setBounds: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      setBounds(map.getBounds());
    }
  });
  
  useEffect(() => {
    setBounds(map.getBounds());
  }, [map, setBounds]);
  
  return null;
}
