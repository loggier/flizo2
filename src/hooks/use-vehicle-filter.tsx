
"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { VehicleStatus } from '@/app/vehicles/page';

interface VehicleFilterContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: VehicleStatus;
  setStatusFilter: (status: VehicleStatus) => void;
}

const VehicleFilterContext = createContext<VehicleFilterContextType | undefined>(undefined);

export const VehicleFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus>('all');
  
  const value = useMemo(() => ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
  }), [searchTerm, statusFilter]);

  return (
    <VehicleFilterContext.Provider value={value}>
      {children}
    </VehicleFilterContext.Provider>
  );
};

export const useVehicleFilter = (): VehicleFilterContextType => {
  const context = useContext(VehicleFilterContext);
  if (context === undefined) {
    throw new Error('useVehicleFilter must be used within a VehicleFilterProvider');
  }
  return context;
};
