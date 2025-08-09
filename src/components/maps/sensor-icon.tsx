
"use client";

import {
    Battery as BatteryIcon,
    Thermometer,
    Gauge,
    Zap,
    Fuel,
    DoorOpen,
    HelpCircle,
    KeySquare,
  } from "lucide-react";
import type { Sensor } from "@/lib/types";

interface SensorIconProps {
  sensor: Sensor;
  className?: string;
}

export function SensorIcon({ sensor, className }: SensorIconProps) {
  const name = sensor.name.toLowerCase();
  const type = sensor.type.toLowerCase();

  // The most specific checks should come first.
  if (type.includes("battery") || name.includes("batería") || name.includes("battery")) {
    return <BatteryIcon className={className} />;
  }
  if (type.includes("ignition") || name.includes("ignición") || name.includes("ignition") || name.includes("acc")) {
    return <Zap className={className} />;
  }
  if (type.includes("engine") || name.includes("motor")) {
    return <KeySquare className={className} />;
  }
  if (type.includes("voltage") || name.includes("voltaje") || name.includes("voltage")) {
    return <Zap className={className} />;
  }
  if (type.includes("temperature") || name.includes("temperatura") || name.includes("temperature")) {
    return <Thermometer className={className} />;
  }
  if (type.includes("fuel") || name.includes("combustible") || name.includes("fuel")) {
    return <Fuel className={className} />;
  }
  if (type.includes("door") || name.includes("puerta") || name.includes("door")) {
    return <DoorOpen className={className} />;
  }
  if (name.includes("rpm")) {
    return <Gauge className={className} />;
  }

  // Default icon
  return <HelpCircle className={className} />;
}
