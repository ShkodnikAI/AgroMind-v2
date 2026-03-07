/**
 * Map Screen — карта сада с позициями растений
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMap } from '../../hooks/useMap';
import { usePlants } from '../../hooks/usePlants';
import { useAlert } from '@/template';
import { theme } from '../../constants/theme';

const INITIAL_REGION: Region = {
  latitude: 55.751244,
  longitude: 37.618423,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

export default function MapScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { markers, updatePlantLocation } = useMap();
  const { plants } = usePlants();
  const mapRef = useRef<MapView>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  
  const plantsWithoutLocation = plants.filter(p => p.latitude == null || p.longitude == null);
  
  const handleMapPress = async (event: any) => {
    if (!isAddingMode || !selectedPlantId) return;
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    try {
      await updatePlantLocation(selectedPlantId, latitude, longitude);
      showAlert('Успешно', 'Растение добавлено на карту');
      setIsAddingMode(false);
      setSelectedPlantId(null);
    } catch (error) {
      // Ошибка уже показана в MapContext
    }
  };
  
  const handleMarkerDragEnd = async (plantId: string, event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    try {
      await updatePlantLocation(plantId, latitude, longitude);
      showAlert('Успешно', 'Позиция обновлена');
    } catch (error) {
      // Ошибка уже показана в MapContext
    }
  };
  
  const handleAddPlantToMap = (plantId: string) => {
    setSelectedPlantId(plantId);
    setIsAddingMode(true);
    showAlert(
      'Режим добавления',
      'Нажмите на карту чтобы разместить растение'
    );
  };
  
  const handleCenterMap = () => {
    if (markers.length > 0) {
      const avgLat = markers.reduce((sum, m) => sum + m.latitude, 0) / markers.length;
      const avgLng = markers.reduce((sum, m) => sum + m.longitude, 0) / markers.length;
      
      mapRef.current?.animateToRegion({
        latitude: avgLat,
        longitude: avgLng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Карта сада</Text>
        {markers.length > 0 && (
          <TouchableOpacity
            style={styles.centerButton}
            onPress={handleCenterMap}
            accessibilityRole="button"
            accessibilityLabel="Центрировать карту"
          >
            <MaterialIcons name="my-location" size={24} color={theme.colors.colorPrimary} />
          </TouchableOpacity>
        )}
      </View>
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.name}
            draggable
            onDragEnd={(e) => handleMarkerDragEnd(marker.id, e)}
            onPress={() => router.push(`/plant/${marker.id}`)}
          >
            {marker.image_url ? (
              <View style={styles.customMarker}>
                <Image
                  source={{ uri: marker.image_url }}
                  style={styles.markerImage}
                />
              </View>
            ) : (
              <View style={styles.defaultMarker}>
                <MaterialIcons name="eco" size={20} color="#FFFFFF" />
              </View>
            )}
          </Marker>
        ))}
      </MapView>
      
      {isAddingMode && selectedPlantId && (
        <View style={styles.addModeOverlay}>
          <View style={styles.addModeCard}>
            <Text style={styles.addModeText}>
              Нажмите на карту чтобы разместить растение
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsAddingMode(false);
                setSelectedPlantId(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {!isAddingMode && plantsWithoutLocation.length > 0 && (
        <View style={styles.plantsPanel}>
          <Text style={styles.panelTitle}>Растения без позиции</Text>
          {plantsWithoutLocation.slice(0, 5).map(plant => (
            <TouchableOpacity
              key={plant.id}
              style={styles.plantItem}
              onPress={() => handleAddPlantToMap(plant.id)}
            >
              <MaterialIcons name="eco" size={20} color={theme.colors.colorPrimary} />
              <Text style={styles.plantName}>{plant.name}</Text>
              <MaterialIcons name="add-location" size={20} color={theme.colors.colorTextTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {markers.length === 0 && plantsWithoutLocation.length === 0 && (
        <View style={styles.emptyOverlay}>
          <MaterialIcons name="map" size={64} color={theme.colors.colorTextTertiary} />
          <Text style={styles.emptyText}>Добавьте растения чтобы увидеть их на карте</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.colorBackground,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.colorText,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.colorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.colors.colorPrimary,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  markerImage: {
    width: 34,
    height: 34,
  },
  defaultMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.colorPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  addModeOverlay: {
    position: 'absolute',
    top: 80,
    left: theme.spacing.md,
    right: theme.spacing.md,
  },
  addModeCard: {
    backgroundColor: theme.colors.colorWarning,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addModeText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: theme.borderRadius.sm,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
  },
  plantsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.colorSurface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    maxHeight: 250,
  },
  panelTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.sm,
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.colorSurfaceVariant,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  plantName: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorText,
    marginLeft: theme.spacing.sm,
  },
  emptyOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorTextSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
