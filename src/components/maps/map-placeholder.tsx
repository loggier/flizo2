
"use client";

import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

function MapComponent() {
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(mapInstance: google.maps.Map) {
    // Normal Map
    const osmMapType = new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        if (!coord || zoom === undefined) {
            return null;
        }
        const tilesPerGlobe = 1 << zoom;
        let x = coord.x % tilesPerGlobe;
        if (x < 0) {
            x = tilesPerGlobe + x;
        }
        return `https://mt0.google.com/vt/lyrs=m&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
      },
      tileSize: new google.maps.Size(256, 256),
      name: "Normal",
      maxZoom: 18
    });

    // Satellite Map
    const satelliteMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            if (!coord || zoom === undefined) {
                return null;
            }
            const tilesPerGlobe = 1 << zoom;
            let x = coord.x % tilesPerGlobe;
            if (x < 0) {
                x = tilesPerGlobe + x;
            }
            const subdomain = ['mt0', 'mt1', 'mt2', 'mt3'][coord.x % 4];
            return `https://${subdomain}.google.com/vt/lyrs=y&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'Satellite',
        maxZoom: 20
    });

    // Traffic Map
    const trafficMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            if (!coord || zoom === undefined) {
                return null;
            }
            const tilesPerGlobe = 1 << zoom;
            let x = coord.x % tilesPerGlobe;
            if (x < 0) {
                x = tilesPerGlobe + x;
            }
            const subdomain = ['mt0', 'mt1', 'mt2', 'mt3'][coord.x % 4];
            return `https://${subdomain}.google.com/vt/lyrs=m@221097413,traffic&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'Traffic',
        maxZoom: 20
    });
    
    mapInstance.mapTypes.set("OSM", osmMapType);
    mapInstance.mapTypes.set("SATELLITE", satelliteMapType);
    mapInstance.mapTypes.set("TRAFFIC", trafficMapType);
    mapInstance.setMapTypeId("OSM");

    setMap(mapInstance);
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
            disableDefaultUI: true,
            scrollwheel: true,
            streetViewControl: true,
        }}
      >
        { /* Child components, like markers, info windows, etc. */ }
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(MapComponent);
