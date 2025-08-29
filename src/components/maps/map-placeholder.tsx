
"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useLoadScript, InfoWindow, MarkerF, Polyline, OverlayView } from '@react-google-maps/api';
import { MarkerClusterer, type Renderer } from '@googlemaps/markerclusterer';
import type { MapType } from '@/app/maps/page';
import type { Device, Geofence, Route, POI, AlertEvent } from '@/lib/types';
import GeofenceMarker from './geofence-marker';
import RouteMarker from './route-marker';
import PoiMarker from './poi-marker';
import { LoaderIcon } from '../icons/loader-icon';
import ZoomControls from './zoom-controls';
import DeviceLabel from './device-label';
import { Pin } from 'lucide-react';
import DeviceMarker from './device-marker';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

const clustererStyles = [
  {
    textColor: "white",
    url: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m1.png",
    height: 53,
    width: 53,
  },
  {
    textColor: "white",
    url: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m2.png",
    height: 56,
    width: 56,
  },
  {
    textColor: "white",
    url: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m3.png",
    height: 66,
    width: 66,
  },
];


interface MapComponentProps {
    mapType: MapType;
    onMapLoad: (map: google.maps.Map | null) => void;
    userPosition: google.maps.LatLngLiteral | null;
    heading: number;
    devices: Device[];
    geofences: Geofence[];
    routes: Route[];
    pois: POI[];
    showLabels: boolean;
    onSelectDevice: (device: Device) => void;
    onDeselectDevice: () => void;
    selectedAlert?: AlertEvent | null;
    selectedDeviceForAlert?: Device | null;
    followedDevice?: Device | null;
}

const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';

function MapComponent({ 
    mapType, 
    onMapLoad, 
    userPosition, 
    heading, 
    devices, 
    geofences, 
    routes,
    pois, 
    showLabels, 
    onSelectDevice, 
    onDeselectDevice,
    selectedAlert,
    selectedDeviceForAlert,
    followedDevice,
}: MapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const [zoom, setZoom] = useState(10);
  
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});
  const clustererRef = useRef<MarkerClusterer | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ['marker'],
  });

  const renderer: Renderer = useMemo(() => ({
    render: ({ count, position }) => {
        const styleIndex = Math.min(String(count).length, clustererStyles.length) - 1;
        const style = clustererStyles[styleIndex];
        return new google.maps.Marker({
            position,
            icon: {
                url: style.url,
                scaledSize: new google.maps.Size(style.width, style.height),
            },
            label: {
                text: String(count),
                color: style.textColor,
                fontSize: "12px",
                fontWeight: 'bold',
            },
            zIndex: 1000 + count,
        });
    }
  }), []);
  
  useEffect(() => {
    if (!map) return;
    if (!clustererRef.current) {
        clustererRef.current = new MarkerClusterer({ map, renderer });
    }
  }, [map, renderer]);
  
  useEffect(() => {
    clustererRef.current?.clearMarkers();
    clustererRef.current?.addMarkers(Object.values(markers));
  }, [markers]);


  const setMarkerRef = useCallback((marker: google.maps.Marker | null, key: string) => {
    setMarkers(prev => {
        if (marker) {
            return { ...prev, [key]: marker };
        } else {
            const newMarkers = { ...prev };
            delete newMarkers[key];
            return newMarkers;
        }
    });
  }, []);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    const osmMapType = new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        if (!coord || zoom === undefined) return null;
        const tilesPerGlobe = 1 << zoom;
        let x = coord.x % tilesPerGlobe;
        if (x < 0) x = tilesPerGlobe + x;
        return `https://mt0.google.com/vt/lyrs=m&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
      },
      tileSize: new google.maps.Size(256, 256),
      name: "Normal",
      maxZoom: 18
    });

    const satelliteMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            if (!coord || zoom === undefined) return null;
            const tilesPerGlobe = 1 << zoom;
            let x = coord.x % tilesPerGlobe;
            if (x < 0) x = tilesPerGlobe + x;
            const subdomain = ['mt0', 'mt1', 'mt2', 'mt3'][coord.x % 4];
            return `https://${subdomain}.google.com/vt/lyrs=y&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'Satellite',
        maxZoom: 20
    });

    const trafficMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            if (!coord || zoom === undefined) return null;
            const tilesPerGlobe = 1 << zoom;
            let x = coord.x % tilesPerGlobe;
            if (x < 0) x = tilesPerGlobe + x;
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
    
    setMap(mapInstance);
    onMapLoad(mapInstance);

    const zoomChangedListener = mapInstance.addListener('zoom_changed', () => {
      setZoom(mapInstance.getZoom() || 10);
    });

    return () => {
      google.maps.event.removeListener(zoomChangedListener);
    }

  }, [onMapLoad]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
    onMapLoad(null);
  }, [onMapLoad]);

  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);

  if (!isLoaded) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <div className="flex flex-col items-center gap-4">
                <LoaderIcon className="h-10 w-10 text-primary" />
                <p className="font-semibold text-primary">Cargando Mapa...</p>
            </div>
        </div>
    );
  }
  
  if (!apiKey) {
    return <div>API Key for Google Maps is missing. Please check your environment variables.</div>;
  }
  
  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 0;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 0;
      map.setZoom(currentZoom - 1);
    }
  };
  
  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onDeselectDevice}
        options={{
            disableDefaultUI: true,
            scrollwheel: true,
            streetViewControl: false,
        }}
      >
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        
        {devices.map((device) => (
            <DeviceMarker 
                key={device.id}
                device={device}
                onLoad={(marker) => setMarkerRef(marker, device.id.toString())}
                onClick={() => onSelectDevice(device)}
                zoom={zoom}
                showLabels={showLabels}
                isFollowed={followedDevice?.id === device.id}
            />
        ))}

        {devices.map(device => (
             <React.Fragment key={`tail-${device.id}`}>
                {device.tail && device.tail.length > 0 && (
                    <Polyline
                      path={device.tail.map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) }))}
                      options={{
                        strokeColor: device.device_data.tail_color,
                        strokeWeight: 2,
                        strokeOpacity: 0.8,
                        zIndex: 1,
                      }}
                    />
                )}
             </React.Fragment>
        ))}


        {geofences.map(geofence => (
          <GeofenceMarker key={`geofence-${geofence.id}`} geofence={geofence} />
        ))}
        {routes.map(route => (
          <RouteMarker key={`route-${route.id}`} route={route} />
        ))}
        {pois.map(poi => (
          <PoiMarker key={`poi-${poi.id}`} poi={poi} />
        ))}

        {selectedAlert && selectedDeviceForAlert && (
          <InfoWindow
            position={{ lat: selectedAlert.latitude, lng: selectedAlert.longitude }}
            onCloseClick={onDeselectDevice}
            options={{
              pixelOffset: new window.google.maps.Size(0, - (selectedDeviceForAlert?.icon?.height || 30) ),
            }}
          >
             <div className="bg-white p-1 rounded-lg max-w-sm">
                <h4 className="font-bold text-sm mb-1">{selectedAlert.device_name}</h4>
                <p className="text-xs text-gray-600"><strong>Dirección:</strong> {selectedAlert.address}</p>
                <p className="text-xs text-gray-600"><strong>Fecha:</strong> {selectedAlert.time}</p>
                <p className="text-xs text-gray-600"><strong>Posición:</strong> {selectedAlert.latitude}, {selectedAlert.longitude}</p>
                <p className="text-xs text-gray-600"><strong>Velocidad:</strong> {selectedAlert.speed} km/h</p>
                <p className="text-xs text-gray-600"><strong>Evento:</strong> {selectedAlert.message}</p>
             </div>
          </InfoWindow>
        )}
      </GoogleMap>
  );
}

export default React.memo(MapComponent);

    