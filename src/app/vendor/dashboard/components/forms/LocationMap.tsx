// forms/LocationMap.tsx
'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './ServiceForms.module.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Turks and Caicos center coordinates
const TURKS_CAICOS_CENTER = {
  lat: 21.694,
  lng: -71.797
};

interface LocationMapProps {
  coordinates: { latitude: number; longitude: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ coordinates, onLocationSelect }) => {
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      },
    });
    return null;
  };

  const position = coordinates.latitude && coordinates.longitude 
    ? [coordinates.latitude, coordinates.longitude] as [number, number]
    : [TURKS_CAICOS_CENTER.lat, TURKS_CAICOS_CENTER.lng] as [number, number];

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[TURKS_CAICOS_CENTER.lat, TURKS_CAICOS_CENTER.lng]}
        zoom={10}
        style={{ height: '300px', width: '100%' }}
        className={styles.leafletMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler />
        {coordinates.latitude && coordinates.longitude && (
          <Marker position={position} />
        )}
      </MapContainer>
    </div>
  );
};

export default LocationMap;