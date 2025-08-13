






export interface Sensor {
  id: number;
  name: string;
  type: string;
  value: string;
  show_in_popup: number;
  value_formula: null | string;
}

export interface Device {
    id: number;
    alarm: number;
    name: string;
    image: null | string;
    online: 'ack' | 'offline' | 'moving' | 'online' | 'engine';
    time: string;
    timestamp: number;
    acktimestamp: number;
    lat: number;
    lng: number;
    course: number;
    speed: number;
    altitude: number;
    icon_type: string;
    icon_color: string;
    icon_colors: {
      moving: string;
      stopped: string;
      offline: string;
      engine: string;
      blocked: string;
    };
    icon: {
      id: number;
      user_id: null | number;
      type: string;
      order: null | number;
      width: number;
      height: number;
      path: string;
      by_status: number;
    };
    power: string;
    address: string;
    protocol: string;
    driver: string;
    driver_data: any;
    sensors: Sensor[];
    services: any[];
    tail: { lat: string; lng: string }[];
    distance_unit_hour: string;
    unit_of_distance: string;
    unit_of_altitude: string;
    unit_of_capacity: string;
    stop_duration: string;
    stop_duration_sec: number;
    moved_timestamp: number;
    engine_status: null | any;
    detect_engine: string;
    engine_hours: string;
    total_distance?: number;
    inaccuracy: null | any;
    sim_expiration_date: string;
    device_data: {
      id: number;
      user_id: number;
      current_driver_id: null | number;
      timezone_id: null | number;
      traccar_device_id: number;
      icon_id: number;
      model_id: null | number;
      icon_colors: {
        moving: string;
        stopped: string;
        offline: string;
        engine: string;
        blocked: string;
      };
      active: number;
      kind: number;
      deleted: number;
      name: string;
      imei: string;
      fuel_measurement_id: number;
      fuel_quantity: string;
      fuel_price: string;
      fuel_per_km: string;
      fuel_per_h: string;
      sim_number: string;
      msisdn: null | string;
      device_model: string;
      plate_number: string;
      vin: string;
      registration_number: string;
      object_owner: string;
      additional_notes: string;
      authentication: null | any;
      comment: string;
      expiration_date: null | string;
      sim_expiration_date: string;
      sim_activation_date: string;
      installation_date: string;
      tail_color: string;
      tail_length: number;
      engine_hours: string;
      detect_engine: string;
      detect_speed: string;
      detect_distance: null | any;
      min_moving_speed: number;
      min_fuel_fillings: number;
      min_fuel_thefts: number;
      snap_to_road: number;
      gprs_templates_only: number;
      valid_by_avg_speed: number;
      max_speed: null | number;
      parameters: string;
      currents: null | any;
      created_at: string;
      updated_at: string;
      forward: null | any;
      device_type_id: null | number;
      app_tracker_login: number;
      fuel_detect_sec_after_stop: number;
      lbs: null | any;
      users: { id: number; email: string }[];
      pivot: {
        user_id: number;
        device_id: number;
        group_id: number;
        active: number;
        current_driver_id: null | number;
        timezone_id: null | number;
      };
      icon: any; 
      traccar: any; 
    };
    lastValidLatitude: number;
    lastValidLongitude: number;
    latest_positions: string;
    group_id: number;
    user_timezone_id: null | number;
  }
  
  export interface DeviceGroup {
    id: number;
    title: string;
    items: Device[];
  }

  export interface Geofence {
    id: number;
    user_id: number;
    group_id: number | null;
    active: number;
    name: string;
    coordinates: string;
    polygon_color: string;
    created_at: string;
    updated_at: string;
    type: 'polygon' | 'circle';
    radius: number | null;
    center: { lat: number, lng: number } | null;
    device_id: null | number;
    speed_limit: null | number;
    diem_rate_id: null | number;
    area?: number;
  }

  export interface Route {
    id: number;
    group_id: number | null;
    active: number;
    name: string;
    color: string;
    coordinates: { lat: number, lng: number }[];
  }

  export interface MapIcon {
    id: number;
    width: number;
    height: number;
    path: string;
    url: string;
  }

  export interface POI {
    id: number;
    user_id: number;
    map_icon_id: number;
    active: number;
    name: string;
    description: string;
    coordinates: string;
    parsedCoordinates?: { lat: number; lng: number };
    created_at: string;
    updated_at: string;
    map_icon: MapIcon;
  }

  export interface AlertEvent {
    id: number;
    user_id: number;
    device_id: number;
    geofence_id: number | null;
    poi_id: number | null;
    position_id: number | null;
    alert_id: number;
    type: string;
    message: string;
    address: string | null;
    altitude: number;
    course: number;
    latitude: number;
    longitude: number;
    power: null;
    speed: number;
    time: string;
    deleted: number;
    created_at: string;
    updated_at: string;
    additional: any | null;
    silent: null;
    name: string;
    detail: string;
    geofence: null;
    device_name: string;
  }

  export interface AlertSetting {
    id: number;
    user_id: number;
    active: 0 | 1;
    name: string;
    type: string;
    schedules: null | any;
    notifications: {
      [key: string]: {
        active: string;
        input?: string;
      }
    };
    created_at: string;
    updated_at: string;
    zone: number;
    schedule: number;
    command: null | any;
    devices: number[];
    drivers: any[];
    geofences: any[];
    events_custom: any[];
  }