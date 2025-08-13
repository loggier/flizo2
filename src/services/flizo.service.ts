

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
    const activeValue = active ? 1 : 0;
    const url = `${serverApi}change_active_alert?user_api_hash=${user_api_hash}&id=${alertId}&active=${activeValue}`;

    const response = await fetch(url);
  
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
  
    const data = await response.json();

    if (!response.ok || data.status !== 1) {
      console.error('Update failed:', data);
      throw new Error(data.message || 'Failed to update alert status');
    }
  
    return data;
}

export async function generateReport(user_api_hash: string, params: any): Promise<{url: string} | null> {
  const response = await fetch(`${serverApi}generate_report`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
      },
      body: JSON.stringify({
          user_api_hash,
          ...params
      }),
  });

  if (response.status === 401) {
      throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (data.status === 3 && data.url) {
      return data;
  } else {
      console.error('Error generating report:', data);
      throw new Error(data.message || 'Failed to generate report');
  }
}
