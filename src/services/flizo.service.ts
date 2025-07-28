
import type { Device, DeviceGroup } from "@/lib/types";

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

export async function getAddress(lat: number, lon: number): Promise<string> {
    const user_api_hash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
    if (!user_api_hash) {
        throw new Error('Unauthorized');
    }
    
    const response = await fetch(`${serverApi}geo_address?user_api_hash=${user_api_hash}&lat=${lat}&lon=${lon}`);

    if (response.status === 401) {
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error('Failed to fetch address');
    }

    const data = await response.text();
    return data;
}
