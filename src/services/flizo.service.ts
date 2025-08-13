

import type { Device, DeviceGroup, Geofence, Route, POI, AlertEvent, AlertSetting } from "@/lib/types";

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

export async function getRoutes(user_api_hash: string): Promise<Route[]> {
    const response = await fetch(`${serverApi}get_routes?user_api_hash=${user_api_hash}`);

    if (response.status === 401) {
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error('Failed to fetch routes');
    }

    const data = await response.json();

    if (data && data.data) {
        return data.data;
    }
    
    return [];
}

export async function getPOIs(user_api_hash: string): Promise<POI[]> {
    const response = await fetch(`${serverApi}get_user_map_icons?user_api_hash=${user_api_hash}`);
  
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
  
    if (!response.ok) {
      throw new Error('Failed to fetch POIs');
    }
  
    const data = await response.json();
    
    if (data && data.items && data.items.mapIcons) {
      return data.items.mapIcons.map((poi: POI) => ({
        ...poi,
        parsedCoordinates: JSON.parse(poi.coordinates),
      }));
    }
    
    return [];
}

export async function getEvents(user_api_hash: string): Promise<AlertEvent[]> {
  const response = await fetch(`${serverApi}get_events?user_api_hash=${user_api_hash}`);

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const data = await response.json();
  
  if (data && data.items && data.items.data) {
    return data.items.data;
  }
  
  return [];
}

export async function getAlerts(user_api_hash: string): Promise<AlertSetting[]> {
    const response = await fetch(`${serverApi}get_alerts?user_api_hash=${user_api_hash}`);
  
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
  
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }
  
    const data = await response.json();
    
    if (data && data.items && data.items.alerts) {
      return data.items.alerts;
    }
    
    return [];
}

export async function updateAlertStatus(user_api_hash: string, alertId: number, active: boolean): Promise<{ status: number }> {
    const response = await fetch(`${serverApi}alerts/${alertId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_api_hash,
        active: active ? 1 : 0,
        name: `dummy_name_${alertId}` // Backend requires a name, sending a placeholder
      }),
    });
  
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update alert status' }));
      console.error('Update failed:', errorData);
      throw new Error(errorData.message || 'Failed to update alert status');
    }
  
    return await response.json();
}