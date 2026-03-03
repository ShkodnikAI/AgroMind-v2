/**
 * usePlants hook — доступ к PlantsContext
 * 
 * @throws если используется вне PlantsProvider
 */

import { useContext } from 'react';
import { PlantsContext } from '../contexts/PlantsContext';

export function usePlants() {
  const context = useContext(PlantsContext);
  
  if (!context) {
    throw new Error('usePlants must be used within PlantsProvider');
  }
  
  return context;
}
