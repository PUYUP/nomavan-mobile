import { getCurrentLocation, reverseGeocodeLocation } from '@/utils/location-service';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useToastController } from '@tamagui/toast';
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, Animated, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView, { Region } from 'react-native-maps';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, View, XStack, YStack } from "tamagui";

export interface PIN {
    note: string;
    lat: number;
	lng: number;
}

const AddPinSubmission = () => {
    const initialDelta = 0.0025;
    const toast = useToastController()
    const { handleSubmit, setValue } = useForm<PIN>();
    const [region, setRegion] = useState<Region | null>(null);
    const [centerCoords, setCenterCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationName, setLocationName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const pinScale = useRef(new Animated.Value(1)).current;
    const mapRef = useRef<MapView | null>(null);
    const lastRegionRef = useRef<Region | null>(null);
    const originalCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const isRevertingRef = useRef(false);
    const isDraggingRef = useRef(false);
    const hasInitialized = useRef(false);
    const onSubmit: SubmitHandler<PIN> = (data) => {
        console.log('Submit!');
        console.log(data);
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
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
                originalCoordsRef.current = { latitude: coords.latitude, longitude: coords.longitude };
                setValue('lat', coords.latitude);
                setValue('lng', coords.longitude);
                const geocoded = await reverseGeocodeLocation(coords.latitude, coords.longitude);
                if (geocoded.ok) {
                    setLocationName(geocoded.data.name);
                }
            }
            setIsLoading(false);
            hasInitialized.current = true;
        };
        init();
    }, [setValue]);

    const updateLocationFromCoords = async (latitude: number, longitude: number) => {
        setValue('lat', latitude);
        setValue('lng', longitude);
        const geocoded = await reverseGeocodeLocation(latitude, longitude);
        if (geocoded.ok) {
            setLocationName(geocoded.data.name);
        }
    };

    const distanceInMeters = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371000;
        const dLat = toRad(b.latitude - a.latitude);
        const dLng = toRad(b.longitude - a.longitude);
        const lat1 = toRad(a.latitude);
        const lat2 = toRad(b.latitude);
        const sinDLat = Math.sin(dLat / 2);
        const sinDLng = Math.sin(dLng / 2);
        const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
        return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
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
        if (isRevertingRef.current) {
            isRevertingRef.current = false;
            return;
        }
        if (originalCoordsRef.current) {
            const distance = distanceInMeters(originalCoordsRef.current, nextRegion);
            if (distance > 100) {
                alert('PIN must be within 100 meters of your current location.');
                const snapRegion: Region = {
                    latitude: originalCoordsRef.current.latitude,
                    longitude: originalCoordsRef.current.longitude,
                    latitudeDelta: lastRegionRef.current?.latitudeDelta ?? nextRegion.latitudeDelta,
                    longitudeDelta: lastRegionRef.current?.longitudeDelta ?? nextRegion.longitudeDelta,
                };
                isRevertingRef.current = true;
                mapRef.current?.animateToRegion(snapRegion, 200);
                lastRegionRef.current = snapRegion;
                setCenterCoords({ latitude: snapRegion.latitude, longitude: snapRegion.longitude });
                await updateLocationFromCoords(snapRegion.latitude, snapRegion.longitude);
                return;
            }
        }
        lastRegionRef.current = nextRegion;
        const { latitude, longitude } = nextRegion;
        setCenterCoords({ latitude, longitude });
        await updateLocationFromCoords(latitude, longitude);
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

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Stack.Screen 
                    options={{ 
                        title: 'Geo Guessr PIN', 
                        headerTitleStyle: {
                            fontSize: 22,
                            fontFamily: 'Inter-Black',
                            color: '#1F3D2B',
                        },
                        headerBackButtonDisplayMode: 'minimal' 
                    }} 
                />

                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContent}
                    enableOnAndroid
                    extraScrollHeight={24}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'never' : 'automatic'}
                >
                    <YStack paddingStart="$0" paddingEnd="$0" flex={1} gap="$2">
                        <Text fontSize={12} opacity={0.7}>Drag the map to place the pin.</Text>
                        <View style={styles.mapCard}>
                            {isLoading || !region ? (
                                <View style={styles.mapLoading}>
                                    <ActivityIndicator size="small" />
                                    <Text opacity={0.7} fontSize={12}>Loading map…</Text>
                                </View>
                            ) : (
                                <View style={styles.mapWrapper}>
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
                        
                        <YStack flex={1}>
                            <XStack style={styles.metaRow}>
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={26} color="#6b7280" />
                                <Text fontSize={13} opacity={0.7} paddingEnd={8}>
                                    {locationName ? locationName : '-'}
                                </Text>
                            </XStack>

                            <XStack style={styles.metaRow}>
                                <MaterialCommunityIcons name="latitude" size={26} color="#6b7280" />
                                <XStack>
                                    <Text fontSize={13} opacity={0.7} width="$6">Latitude</Text>
                                    <Text fontSize={13} opacity={0.7}>: {centerCoords?.latitude}</Text>
                                </XStack>
                            </XStack>

                            <XStack style={styles.metaRow}>
                                <MaterialCommunityIcons name="longitude" size={26} color="#6b7280" />
                                <XStack>
                                    <Text fontSize={13} opacity={0.7} width="$6">Latitude</Text>
                                    <Text fontSize={13} opacity={0.7}>: {centerCoords?.longitude}</Text>
                                </XStack>
                            </XStack>
                        </YStack>
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                    <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton}>
                        <Text color={'white'} fontSize={20}>Set PIN</Text>
                    </Button>
                </View>
            </SafeAreaView>
        </>
    )
}

export default AddPinSubmission;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    mapCard: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f8fafc',
        height: 260,
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
    submitButton: {
		backgroundColor: '#00bcd4',
		color: '#fff',
		marginTop: 'auto',
	},
    metaRow: {
		alignItems: 'center',
		gap: 6,
        marginTop: 4,
	},
})