/**
 * MapContext — управление позициями растений на карте сада
 */

import React, { createContext, ReactNode } from 'react';
import { usePlants } from '../hooks/usePlants';
import { useAlert } from '@/template';

export interface PlantMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
}

interface MapContextType {
  markers: PlantMarker[];
  updatePlantLocation: (plantId: string, latitude: number, longitude: number) => Promise<void>;
}

export const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const { plants, updatePlant } = usePlants();
  const { showAlert } = useAlert();
  
  const markers: PlantMarker[] = plants
    .filter(p => p.latitude != null && p.longitude != null)
    .map(p => ({
      id: p.id,
      name: p.name,
      latitude: p.latitude!,
      longitude: p.longitude!,
      image_url: p.image_url,
    }));
  
  const updatePlantLocation = async (
    plantId: string,
    latitude: number,
    longitude: number
  ): Promise<void> => {
    try {
      await updatePlant(plantId, { latitude, longitude });
    } catch (error: any) {
      console.error('[MapContext] Ошибка обновления позиции:', error);
      showAlert('Ошибка', error.message || 'Не удалось сохранить позицию');
      throw error;
    }
  };
  
  const value: MapContextType = {
    markers,
    updatePlantLocation,
  };
  
  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}
