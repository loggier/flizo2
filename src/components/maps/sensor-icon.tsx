
"use client";

import {
    Battery,
    Thermometer,
    Gauge,
    Zap,
    Fuel,
    DoorOpen,
    HelpCircle,
  } from "lucide-react";
import type { Sensor } from "@/lib/types";

interface SensorIconProps {
  sensor: Sensor;
  className?: string;
}

export function SensorIcon({ sensor, className }: SensorIconProps) {
  const name = sensor.name.toLowerCase();

  if (name.includes("batería") || name.includes("battery")) {
    return <Battery className={className} />;
  }
  if (name.includes("voltaje") || name.includes("voltage")) {
    return <Zap className={className} />;
  }
  if (name.includes("temperatura") || name.includes("temperature")) {
    return <Thermometer className={className} />;
  }
  if (name.includes("combustible") || name.includes("fuel")) {
    return <Fuel className={className} />;
  }
  if (name.includes("puerta") || name.includes("door")) {
    return <DoorOpen className={className} />;
  }
  if (name.includes("ignición") || name.includes("ignition")) {
    return <Zap className={className} />;
  }
  if (name.includes("rpm")) {
    return <Gauge className={className} />;
  }

  // Default icon
  return <HelpCircle className={className} />;
}
