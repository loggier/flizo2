
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, InfoWindow, MarkerClustererF } from '@react-google-maps/api';
import type { MapType } from '@/app/maps/page';
import type { Device, Geofence, Route, POI, AlertEvent } from '@/lib/types';
import DeviceMarker from './device-marker';
import GeofenceMarker from './geofence-marker';
import RouteMarker from './route-marker';
import PoiMarker from './poi-marker';
import { LoaderIcon } from '../icons/loader-icon';
import { Pin } from 'lucide-react';
import type { ClustererOptions, Cluster } from '@googlemaps/markerclusterer';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

const clustererOptions: ClustererOptions = {
    styles: [
        {
            url: 'data:image/svg+xml;charset=UTF-8,' +
                encodeURIComponent(
                    '<svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M26.5 48C38.3741 48 48 38.3741 48 26.5C48 14.6259 38.3741 5 26.5 5C14.6259 5 5 14.6259 5 26.5C5 38.3741 14.6259 48 26.5 48Z" stroke="#34D399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 10" transform="rotate(45 26.5 26.5)"/>' +
                    '<path d="M26.5 53C41.1223 53 53 41.1223 53 26.5C53 11.8777 41.1223 0 26.5 0C11.8777 0 0 11.8777 0 26.5C0 41.1223 11.8777 53 26.5 53Z" stroke="#34D399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 10" transform="rotate(45 26.5 26.5)"/>' +
                    '<circle cx="26.5" cy="26.5" r="20" fill="#F472B6" fill-opacity="0.9"/>' +
                    '</svg>'
                ),
            height: 53,
            width: 53,
            textColor: '#FFFFFF',
            textSize: 14,
            anchorText: [0, 0],
        },
        {
            url: 'data:image/svg+xml;charset=UTF-8,' +
                encodeURIComponent(
                    '<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M28 50C40.1503 50 50 40.1503 50 28C50 15.8497 40.1503 6 28 6C15.8497 6 6 15.8497 6 28C6 40.1503 15.8497 50 28 50Z" stroke="#34D399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 10" transform="rotate(45 28 28)"/>' +
                    '<path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" stroke="#34D399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 10" transform="rotate(45 28 28)"/>' +
                    '<circle cx="28" cy="28" r="21" fill="#F472B6" fill-opacity="0.9"/>' +
                    '</svg>'
                ),
            height: 56,
            width: 56,
            textColor: '#FFFFFF',
            textSize: 16,
            anchorText: [0, 0],
        },
        {
            url: 'data:image/svg+xml;charset=UTF-8,' +
                encodeURIComponent(
                    '<svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M33 59C47.3594 59 59 47.3594 59 33C59 18.6406 47.3594 7 33 7C18.6406 7 7 18.6406 7 33C7 47.3594 18.6406 59 33 59Z" stroke="#34D399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 10" transform="rotate(45 33 33)"/>' +
                    '<path d="M33 66C51.2254 66 66 51.2254 66 33C66 14.7746 51.2254 0 33 0C14.7746 0 0 14.7746 0 33C0 51.2254 14.7746 66 33 66Z" stroke="#34D399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 10" transform="rotate(45 33 33)"/>' +
                    '<circle cx="33" cy="33" r="25" fill="#F472B6" fill-opacity="0.9"/>' +
                    '</svg>'
                ),
            height: 66,
            width: 66,
            textColor: '#FFFFFF',
            textSize: 18,
            anchorText: [0, 0],
        },
    ],
    calculator: (markers: google.maps.Marker[], numStyles: number): { text: string; index: number } => {
        const count = markers.length;
        let index = 0;
        if (count > 10) {
            index = 1;
        }
        if (count > 100) {
            index = 2;
        }
        return {
            text: count.toString(),
            index: index + 1, // ClusterIconStyle index is 1-based
        };
    },
};

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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const handleZoomChanged = useCallback(() => {
    if (map) {
        setZoom(map.getZoom() || 10);
    }
  }, [map]);

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

  const userLocationIcon = (typeof window !== 'undefined' && window.google) ? {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 7,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      rotation: heading,
      anchor: new google.maps.Point(0, 2.6)
  } : undefined;

  const userCircleIcon = (typeof window !== 'undefined' && window.google) ? {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 14,
      fillColor: '#4285F4',
      fillOpacity: 0.3,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
  } : undefined;
  
  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onDeselectDevice}
        onZoomChanged={handleZoomChanged}
        options={{
            disableDefaultUI: true,
            scrollwheel: true,
            streetViewControl: false,
        }}
      >
        {userPosition && userLocationIcon && userCircleIcon && (
          <DeviceMarker
            device={{
              id: -1,
              name: 'Tu ubicación',
              lat: userPosition.lat,
              lng: userPosition.lng,
              course: heading,
              speed: 0,
              online: 'ack',
              icon: { path: '', width: 30, height: 30 },
              tail: [],
              icon_colors: { moving: '', stopped: '', offline: '', engine: '', blocked: ''},
              device_data: { tail_color: '#4285F4' }
            } as any}
            isUserLocation={true}
            userLocationIcon={userLocationIcon}
            userCircleIcon={userCircleIcon}
            showLabel={false}
            onSelect={() => {}}
            mapZoom={zoom}
          />
        )}
        <MarkerClustererF options={clustererOptions}>
            {(clusterer) =>
              devices.map((device) => (
                device && <DeviceMarker 
                  key={device.id} 
                  device={device} 
                  isUserLocation={false} 
                  showLabel={showLabels}
                  onSelect={onSelectDevice}
                  isFollowed={followedDevice?.id === device.id}
                  clusterer={clusterer}
                  mapZoom={zoom}
                />
              ))
            }
        </MarkerClustererF>
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
