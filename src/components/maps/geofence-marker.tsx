"use client";

import React, { useMemo, useEffect } from 'react';
import { Polygon, OverlayView, Circle } from '@react-google-maps/api';
import type { Geofence } from '@/lib/types';
import { useGoogleMap } from '@react-google-maps/api';

interface GeofenceMarkerProps {
  geofence: Geofence;
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getCenter = (geofence: Geofence): google.maps.LatLng | null => {
    if (geofence.type === 'circle' && geofence.center) {
        return new google.maps.LatLng(geofence.center.lat, geofence.center.lng);
    }
    if (geofence.type === 'polygon' && geofence.coordinates) {
        try {
            const coords = JSON.parse(geofence.coordinates);
            if (coords.length === 0) return null;
            const bounds = new google.maps.LatLngBounds();
            coords.forEach((c: { lat: number, lng: number }) => bounds.extend(c));
            return bounds.getCenter();
        } catch (e) {
            return null;
        }
    }
    return null;
}

const GeofenceMarker = ({ geofence }: GeofenceMarkerProps) => {
    const map = useGoogleMap();
    const { polygon_color, type, coordinates, center: geofenceCenter, radius } = geofence;

    const fillColor = useMemo(() => hexToRgba(polygon_color, 0.3), [polygon_color]);

    const polygonPath = useMemo(() => {
        if (type !== 'polygon' || !coordinates) return [];
        try {
            return JSON.parse(coordinates);
        } catch (e) {
            console.error("Failed to parse polygon coordinates", e);
            return [];
        }
    }, [type, coordinates]);

    const polygon = useMemo(() => {
        if (type !== 'polygon' || !map) return null;
        return new google.maps.Polygon({
            paths: polygonPath,
            fillColor,
            strokeColor: polygon_color,
            strokeWeight: 2,
        });
    }, [polygonPath, fillColor, polygon_color, map, type]);

    const circle = useMemo(() => {
        if (type !== 'circle' || !map || !geofenceCenter || !radius) return null;
        return new google.maps.Circle({
            center: geofenceCenter,
            radius: radius,
            fillColor,
            strokeColor: polygon_color,
            strokeWeight: 2,
        });
    }, [geofenceCenter, radius, fillColor, polygon_color, map, type]);

    useEffect(() => {
        if (polygon && map) {
            polygon.setMap(map);
        }
        if (circle && map) {
            circle.setMap(map);
        }
        return () => {
            if (polygon) {
                polygon.setMap(null);
            }
            if (circle) {
                circle.setMap(null);
            }
        };
    }, [polygon, circle, map]);
    
    const center = useMemo(() => getCenter(geofence), [geofence]);

    if (!center) return null;

    const labelStyle: React.CSSProperties = {
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        border: `1px solid ${polygon_color}`
    };

    return (
        <OverlayView
            position={center}
            mapPaneName={OverlayView.OVERLAY_LAYER}
        >
            <div style={labelStyle}>{geofence.name}</div>
        </OverlayView>
    );
};

export default React.memo(GeofenceMarker);