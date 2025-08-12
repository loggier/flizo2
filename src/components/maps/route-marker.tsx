
"use client";

import React, { useMemo, useEffect } from 'react';
import { Polyline, OverlayView } from '@react-google-maps/api';
import type { Route } from '@/lib/types';
import { useGoogleMap } from '@react-google-maps/api';

interface RouteMarkerProps {
  route: Route;
}

const getCenter = (coordinates: {lat: number, lng: number}[]): google.maps.LatLng | null => {
    if (coordinates.length === 0) return null;
    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach(c => bounds.extend(c));
    return bounds.getCenter();
}

const RouteMarker = ({ route }: RouteMarkerProps) => {
    const map = useGoogleMap();
    const { color, coordinates, name } = route;

    const center = useMemo(() => getCenter(coordinates), [coordinates]);
    
    const polyline = useMemo(() => {
        if (!map) return null;
        const pl = new google.maps.Polyline({
            path: coordinates,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 4,
            zIndex: 50,
        });
        return pl;
    }, [coordinates, color, map]);

    useEffect(() => {
        if (polyline && map) {
            polyline.setMap(map);
        }
        return () => {
            if (polyline) {
                polyline.setMap(null);
            }
        };
    }, [polyline, map]);

    if (!center) return null;

    const labelStyle: React.CSSProperties = {
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        border: `1px solid ${color}`
      };

    return (
        <OverlayView
            position={center}
            mapPaneName={OverlayView.OVERLAY_LAYER}
        >
            <div style={labelStyle}>{name}</div>
        </OverlayView>
    );
};

export default React.memo(RouteMarker);
