/**
 * useGardens hook — доступ к GardensContext
 * 
 * @throws если используется вне GardensProvider
 */

import { useContext } from 'react';
import { GardensContext } from '../contexts/GardensContext';

export function useGardens() {
  const context = useContext(GardensContext);
  
  if (!context) {
    throw new Error('useGardens must be used within GardensProvider');
  }
  
  return context;
}
