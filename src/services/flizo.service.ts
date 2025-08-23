
import type { Device, DeviceGroup, Geofence, Route, POI, AlertEvent, AlertSetting, HistoryData, Command } from "@/lib/types";

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
    const queryParams = new URLSearchParams({
        user_api_hash,
        ...params,
    });
    
    const devices = params.devices || [];
    queryParams.delete('devices');
    devices.forEach((deviceId: number) => {
        queryParams.append('devices[]', deviceId.toString());
    });

    const response = await fetch(`${serverApi}generate_report?${queryParams.toString()}`, {
        method: 'GET',
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

export async function getHistory(user_api_hash: string, params: {
    device_id: number;
    from_date: string;
    from_time: string;
    to_date: string;
    to_time: string;
    snap_to_road: boolean;
}): Promise<HistoryData> {
    const queryParams = new URLSearchParams({
        user_api_hash,
        device_id: params.device_id.toString(),
        from_date: params.from_date,
        from_time: params.from_time,
        to_date: params.to_date,
        to_time: params.to_time,
        snap_to_road: params.snap_to_road ? 'true' : 'false',
        '_': Date.now().toString()
    });

    const response = await fetch(`${serverApi}get_history?${queryParams.toString()}`);

    if (response.status === 401) {
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }

    const data = await response.json();

    if (data.status === 0) {
        throw new Error(data.message || 'Error fetching history data');
    }
    
    return data as HistoryData;
}

export async function getDeviceCommands(user_api_hash: string, device_id: number): Promise<Command[]> {
    const response = await fetch(`${serverApi}get_device_commands?user_api_hash=${user_api_hash}&device_id=${device_id}`);

    if (response.status === 401) {
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error('Failed to fetch device commands');
    }

    const data = await response.json();
    
    if (data && Array.isArray(data)) {
        return data.filter((cmd: Command) => cmd.type.split('_')[0] !== 'custom');
    }

    return [];
}

export async function sendGPRSCommand(user_api_hash: string, params: { type: string; device_id: number; data?: any; index: number; }): Promise<any> {
    const url = `${serverApi}send_gprs_command`;
    
    const body = new URLSearchParams();
    body.append('user_api_hash', user_api_hash);
    body.append('type', params.type);
    body.append('device_id', params.device_id.toString());
    body.append('devices[]', params.device_id.toString());
    body.append('index', params.index.toString());
    
    if (params.data) {
        body.append('data', params.data);
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
    });

    if (response.ok) {
        return { status: 1, message: 'Comando enviado con éxito.' };
    }

    // If not OK, try to parse error
    let errorData;
    try {
        errorData = await response.json();
    } catch (e) {
        // Body is not JSON or empty
        throw new Error('Failed to send command. Server responded with status ' + response.status);
    }
    
    if (errorData && errorData.message) {
        throw new Error(errorData.message);
    }

    throw new Error('Failed to send command. Server responded with status ' + response.status);
}

export async function createSharingLink(user_api_hash: string, deviceId: number, expirationDate: string): Promise<{ hash: string }> {
    const url = `${serverApi}sharing`;

    const body = new URLSearchParams();
    body.append('user_api_hash', user_api_hash);
    body.append('expiration_by', 'date');
    body.append('expiration_date', expirationDate);
    body.append('duration', '1');
    body.append('delete_after_expiration', '1');
    body.append('send_sms', '0');
    body.append('send_email', '0');
    body.append('active', '1');
    body.append('name', 'App');
    body.append('devices[]', deviceId.toString());

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create sharing link' }));
        throw new Error(errorData.message);
    }

    const responseData = await response.json();

    if (responseData && responseData.data && responseData.data.hash) {
        return responseData.data;
    }

    throw new Error('Invalid response from server when creating sharing link');
}

export async function changePassword(user_api_hash: string, current_password: string,password: string, password_confirmation: string): Promise<any> {
    const url = `${serverApi}change_password?user_api_hash=${user_api_hash}&password_current=${current_password}&password=${password}&password_confirmation=${password_confirmation}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status !== 1) {
        throw new Error(data.message || "Failed to change password");
    }

    return data;
}

export async function getUserData(user_api_hash: string): Promise<{email: string} | null> {
    const response = await fetch(`${serverApi}get_user_data?user_api_hash=${user_api_hash}`);
  
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
  
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
  
    const data = await response.json();
    
    if (data && data.email) {
      return { email: data.email };
    }
    
    return null;
}
