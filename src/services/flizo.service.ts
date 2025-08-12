

import type { Device, DeviceGroup, Geofence, GeofenceGroup } from "@/lib/types";

const serverApi = process.env.NEXT_PUBLIC_serverApi || 'https://s1.flizo.app/api/';

export async function getDevices(user_api_hash: string): Promise<DeviceGroup[]> {
  const response = await fetch(`${serverApi}get_devices?user_api_hash=${user_api_hash}`);

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch devices');
  }

  const data: DeviceGroup[] = await response.json();

  if (!data) {
    return [];
  }
  
  return data;
}

export async function getAddress(lat: number, lon: number): Promise<string | null> {
    const user_api_hash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
    if (!user_api_hash) {
        throw new Error('Unauthorized');
    }
    
    try {
        const response = await fetch(`${serverApi}geo_address?user_api_hash=${user_api_hash}&lat=${lat}&lon=${lon}`);

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch address');
        }

        const data = await response.text();
        
        if (data.trim() === '-') {
            return null;
        }
        
        return data;

    } catch (error) {
        console.error("getAddress error:", error);
        return null;
    }
}

export async function getGeofences(user_api_hash: string): Promise<Geofence[]> {
  const response = await fetch(`${serverApi}get_geofences?user_api_hash=${user_api_hash}`);

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch geofences');
  }

  const data = await response.json();
  
  if (data && data.items && data.items.geofences) {
    return data.items.geofences;
  }
  
  return [];
}
