import { getCurrentLocation, reverseGeocodeLocation } from '@/services/location';
import { emitLocationSelected, emitLocationSelection, getLastLocationSelected } from '@/utils/location-selector';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, View, XStack, YStack } from 'tamagui';

export default function MapScreen() {
  const router = useRouter();
  const { returnTo, initialLat, initialLng, initialAddress, purpose } = useLocalSearchParams<{
    returnTo?: string;
    initialLat?: string;
    initialLng?: string;
    initialAddress?: string;
    purpose?: string;
  }>();
  const initialDelta = 0.0025;
  const [region, setRegion] = useState<Region | null>(null);
  const [centerCoords, setCenterCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const pinScale = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView | null>(null);
  const lastRegionRef = useRef<Region | null>(null);
  const isDraggingRef = useRef(false);
  const hasInitialized = useRef(false);

  const purposeLabel = purpose === 'origin'
    ? 'Origin'
    : purpose === 'destination'
      ? 'Destination'
      : purpose
        ? `${purpose.charAt(0).toUpperCase()}${purpose.slice(1)}`
        : 'Location';

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      const parsedLat = initialLat ? Number(initialLat) : null;
      const parsedLng = initialLng ? Number(initialLng) : null;
      const saved = getLastLocationSelected();

      if (parsedLat && parsedLng) {
        const nextRegion: Region = {
          latitude: parsedLat,
          longitude: parsedLng,
          latitudeDelta: initialDelta,
          longitudeDelta: initialDelta,
        };
        setRegion(nextRegion);
        lastRegionRef.current = nextRegion;
        setCenterCoords({ latitude: parsedLat, longitude: parsedLng });
        const address = initialAddress ?? '';
        setLocationName(address);
        emitLocationSelection({
          latitude: parsedLat,
          longitude: parsedLng,
          address,
          purpose,
        });
        setIsLoading(false);
        hasInitialized.current = true;
        return;
      }

      if (saved) {
        const nextRegion: Region = {
          latitude: saved.latitude,
          longitude: saved.longitude,
          latitudeDelta: initialDelta,
          longitudeDelta: initialDelta,
        };
        setRegion(nextRegion);
        lastRegionRef.current = nextRegion;
        setCenterCoords({ latitude: saved.latitude, longitude: saved.longitude });
        setLocationName(saved.address ?? '');
        emitLocationSelection({
          ...saved,
          purpose,
        });
        setIsLoading(false);
        hasInitialized.current = true;
        return;
      }

      const location = await getCurrentLocation();
      if (location.ok) {
        const coords = location.data.coords;
        const nextRegion: Region = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: initialDelta,
          longitudeDelta: initialDelta,
        };
        setRegion(nextRegion);
        lastRegionRef.current = nextRegion;
        setCenterCoords({ latitude: coords.latitude, longitude: coords.longitude });
        const geocoded = await reverseGeocodeLocation(coords.latitude, coords.longitude);
        const address = geocoded.ok ? geocoded.data.name : '';
        setLocationName(address);
        emitLocationSelection({
          latitude: coords.latitude,
          longitude: coords.longitude,
          address,
          purpose,
        });
      }
      setIsLoading(false);
      hasInitialized.current = true;
    };
    init();
  }, [initialAddress, initialDelta, initialLat, initialLng]);

  const updateLocationFromCoords = async (latitude: number, longitude: number) => {
    const geocoded = await reverseGeocodeLocation(latitude, longitude);
    const address = geocoded.ok ? geocoded.data.name : '';
    setLocationName(address);
    emitLocationSelection({ latitude, longitude, address, purpose });
  };

  const handleRegionChangeComplete = async (nextRegion: Region) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      Animated.spring(pinScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start();
    }
    if (!hasInitialized.current) {
      return;
    }
    lastRegionRef.current = nextRegion;
    const { latitude, longitude } = nextRegion;
    setCenterCoords({ latitude, longitude });
    await updateLocationFromCoords(latitude, longitude);
  };

  const handleRegionChange = () => {
    if (!isDraggingRef.current) {
      isDraggingRef.current = true;
      Animated.spring(pinScale, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start();
    }
  };

  const zoomBy = (factor: number) => {
    const currentRegion = lastRegionRef.current || region;
    if (!currentRegion || !mapRef.current) {
      return;
    }
    const nextRegion: Region = {
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta * factor,
      longitudeDelta: currentRegion.longitudeDelta * factor,
    };
    mapRef.current.animateToRegion(nextRegion, 180);
    lastRegionRef.current = nextRegion;
  };

  const handleConfirm = () => {
    if (!centerCoords) {
      return;
    }
    const payload = {
      latitude: String(centerCoords.latitude),
      longitude: String(centerCoords.longitude),
      address: locationName ?? '',
      purpose,
    };
    emitLocationSelected({
      latitude: centerCoords.latitude,
      longitude: centerCoords.longitude,
      address: locationName ?? '',
      purpose,
    });
    if (returnTo) {
      router.replace({ pathname: returnTo as any, params: payload });
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{
        title: `Select ${purposeLabel}`,
        headerTitleStyle: {
          fontSize: 20,
          fontFamily: 'Inter-Black',
          color: '#1F3D2B',
        },
        headerRight: () => {
          return (
            <Button
              size="$3"
              onPress={() => router.back()}
              style={styles.closeButton}
              accessibilityLabel="Close"
              circular
            >
              <MaterialCommunityIcons name="close" size={20} />
            </Button>
          )
        }
      }} />
      
      <YStack paddingStart="$0" paddingEnd="$0" flex={1} gap="$2">
        <Text fontSize={14} opacity={0.7}>{`Editing: ${purposeLabel}`}</Text>
        <View style={styles.mapCard}>
          {isLoading || !region ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="small" />
              <Text opacity={0.7} fontSize={12}>Loading map…</Text>
            </View>
          ) : (
            <View style={styles.mapWrapper}>
              <View style={styles.mapHint}>
                <Text fontSize={12} opacity={0.7}>
                  Drag the map to place the pin.
                </Text>
              </View>
              <MapView
                ref={(ref) => { mapRef.current = ref; }}
                style={styles.map}
                initialRegion={region}
                onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
              />
              <View style={styles.centerMarker} pointerEvents="none">
                <Animated.View style={{ transform: [{ scale: pinScale }] }}>
                  <MaterialCommunityIcons name="map-marker" size={42} color="#ff3b30" />
                </Animated.View>
              </View>
              <View style={styles.zoomControls}>
                <Button
                  size="$2"
                  style={styles.zoomButton}
                  onPress={() => zoomBy(0.5)}
                >
                  <MaterialCommunityIcons name="plus" size={18} />
                </Button>
                <Button
                  size="$2"
                  style={styles.zoomButton}
                  onPress={() => zoomBy(2)}
                >
                  <MaterialCommunityIcons name="minus" size={18} />
                </Button>
              </View>
            </View>
          )}
        </View>

        <YStack gap="$0" marginBlockStart="$2">
          <XStack style={[styles.metaRow, { paddingEnd: 16 }]}
          >
            <MaterialCommunityIcons name="map-marker-radius-outline" size={26} color="#6b7280" />
            <Text fontSize={13}>{locationName ? locationName : '-'}</Text>
          </XStack>

          <XStack style={styles.metaRow}>
            <MaterialCommunityIcons name="crosshairs-gps" size={26} color="#6b7280" />
            <XStack>
              <Text fontSize={13} opacity={0.7}>{centerCoords?.latitude}</Text>
              <Text marginStart={1} marginEnd={3}>,</Text>
              <Text fontSize={13} opacity={0.7}>{centerCoords?.longitude}</Text>
            </XStack>
          </XStack>
        </YStack>

        <XStack marginBlockStart="auto" gap="$2">
          <Button flex={1} onPress={() => router.back()}>
            <Text fontSize={16}>Cancel</Text>
          </Button>
          <Button
            flex={1}
            onPress={handleConfirm}
            style={styles.submitButton}
            disabled={!centerCoords}
          >
            <Text color={'white'} fontSize={16}>Use this location</Text>
          </Button>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  mapCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    height: 320,
  },
  mapWrapper: {
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -16 }, { translateY: -32 }],
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    top: 10,
    gap: 6,
  },
  zoomButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapHint: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  metaRow: {
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  modalHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  submitButton: {
    backgroundColor: '#00bcd4',
    color: '#fff',
    marginTop: 'auto',
  },
});
