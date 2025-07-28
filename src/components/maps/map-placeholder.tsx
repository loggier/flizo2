
"use client";

import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

const mapOptions: google.maps.MapOptions = {
  zoomControl: false,
  streetViewControl: true,
  mapTypeControl: false,
  fullscreenControl: false,
  mapTypeId: "OSM", // Set the map type ID on initialization
};

function MapComponent() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" // No API key needed for this method
  });

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
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
        return 'https://mt0.google.com/vt/lyrs=m&x=' + x + '&y=' + coord.y + '&z=' + zoom +
            '&s=Ga';
      },
      tileSize: new google.maps.Size(256, 256),
      name: "OpenStreetMap",
      maxZoom: 18
    });
    
    map.mapTypes.set("OSM", osmMapType);
    // The mapTypeId is already set in options, so we don't need to set it again here.
  }, []);

  if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>;
  }

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        options={mapOptions}
      >
        { /* Child components, like markers, info windows, etc. */ }
      </GoogleMap>
  ) : <div>Loading Map...</div>
}

export default React.memo(MapComponent);
