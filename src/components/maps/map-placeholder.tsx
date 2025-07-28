
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

const mapOptions = {
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

function MapComponent() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" // We don't need an API key for this method
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
    map.setMapTypeId("OSM");

  }, []);

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
  ) : <></>
}

export default React.memo(MapComponent);
