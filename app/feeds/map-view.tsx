import { MarkerCallout } from '@/components/map/marker-callout';
import SignalMarker from '@/components/map/signal-marker';
import { BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/activity';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text as NText, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, View, YStack } from 'tamagui';

type MarkerData = {
    id: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
    items: any[];
    secondary_item?: any;
    user_profile: any;
    activityType: string;
};

const MapViewScreen = () => {
    const params = useLocalSearchParams<{ component?: string; type?: string; title?: string }>();
    
    const activitiesQueryArgs: BPActivityFilterArgs = { 
        page: 1,
        per_page: 50,
        // component: params.component || 'activity',
        type: params.type ? (Array.isArray(params.type) ? params.type : [params.type]) : ['new_expense'],
    };
    const { data, isLoading, error, refetch } = useGetActivitiesQuery(activitiesQueryArgs);
    
    const mapRef = useRef<MapView>(null);
    const markerRefs = useRef<{ [key: string]: any }>({});
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
    const [currentRegion, setCurrentRegion] = useState<Region>({
        latitude: -6.2088,
        longitude: 106.8456,
        latitudeDelta: 2,
        longitudeDelta: 2,
    });

    const initialRegion: Region = {
        latitude: -6.2088,
        longitude: 106.8456,
        latitudeDelta: 2,
        longitudeDelta: 2,
    };

    // Get user's current location on mount
    useEffect(() => {
        refetch(); // Ensure fresh data on mount
        
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Location permission denied');
                    return;
                }

                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                const userRegion: Region = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5,
                };

                setCurrentRegion(userRegion);
                mapRef.current?.animateToRegion(userRegion, 500);
            } catch (error) {
                console.error('Error getting location:', error);
            }
        })();
    }, []);

    // Transform activities to markers
    useEffect(() => {
        if (data && data.length > 0) {
            const newMarkers: MarkerData[] = data
                .filter(activity => {
                    const lat = activity.secondary_item?.meta?.latitude || activity.primary_item?.latitude;
                    const lng = activity.secondary_item?.meta?.longitude || activity.primary_item?.longitude;

                    if (!lat || !lng) return false;
                    
                    // Parse and validate coordinates
                    const latitude = parseFloat(lat);
                    const longitude = parseFloat(lng);
                    
                    // Check if valid numbers and within valid ranges
                    const isValidLat = !isNaN(latitude) && isFinite(latitude) && latitude >= -90 && latitude <= 90;
                    const isValidLng = !isNaN(longitude) && isFinite(longitude) && longitude >= -180 && longitude <= 180;
 
                    return isValidLat && isValidLng;
                })
                .map(activity => ({
                    id: activity.id.toString(),
                    coordinate: {
                        latitude: activity.secondary_item ? parseFloat(activity.secondary_item.meta.latitude) : parseFloat(activity.primary_item.latitude),
                        longitude: activity.secondary_item ? parseFloat(activity.secondary_item.meta.longitude) : parseFloat(activity.primary_item.longitude),
                    },
                    items: activity.secondary_item?.meta?.expense_items_inline || [],
                    secondary_item: activity.secondary_item,
                    primary_item: activity.primary_item,
                    user_profile: activity.user_profile,
                    activityType: activity.type,
                }));
            
            setMarkers(newMarkers);

            // Auto-fit map to show all markers
            if (newMarkers.length > 0) {
                setTimeout(() => {
                    try {
                        if (newMarkers.length === 1) {
                            // Single marker: center and zoom in
                            const region = {
                                latitude: newMarkers[0].coordinate.latitude,
                                longitude: newMarkers[0].coordinate.longitude,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            };
                            mapRef.current?.animateToRegion(region, 500);
                        } else {
                            // Multiple markers: calculate bounds
                            const coords = newMarkers.map(m => m.coordinate);
                            const latitudes = coords.map(c => c.latitude);
                            const longitudes = coords.map(c => c.longitude);
                            
                            const minLat = Math.min(...latitudes);
                            const maxLat = Math.max(...latitudes);
                            const minLng = Math.min(...longitudes);
                            const maxLng = Math.max(...longitudes);
                            
                            const latDelta = (maxLat - minLat) * 1.5; // Add 50% padding
                            const lngDelta = (maxLng - minLng) * 1.5;
                            
                            // Ensure deltas are within reasonable bounds
                            const validLatDelta = Math.min(Math.max(latDelta, 0.01), 180);
                            const validLngDelta = Math.min(Math.max(lngDelta, 0.01), 360);
                            
                            const centerLat = (minLat + maxLat) / 2;
                            const centerLng = (minLng + maxLng) / 2;
                            
                            // Validate center coordinates
                            if (centerLat >= -90 && centerLat <= 90 && centerLng >= -180 && centerLng <= 180) {
                                const region = {
                                    latitude: centerLat,
                                    longitude: centerLng,
                                    latitudeDelta: validLatDelta,
                                    longitudeDelta: validLngDelta,
                                };
                                mapRef.current?.animateToRegion(region, 500);
                            }
                        }
                    } catch (error) {
                        console.error('Error fitting map to coordinates:', error);
                    }
                }, 100);
            }
        }
    }, [data]);

    const zoomIn = () => {
        const newRegion = {
            ...currentRegion,
            latitudeDelta: currentRegion.latitudeDelta / 2,
            longitudeDelta: currentRegion.longitudeDelta / 2,
        };
        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 300);
    };

    const zoomOut = () => {
        const newRegion = {
            ...currentRegion,
            latitudeDelta: currentRegion.latitudeDelta * 2,
            longitudeDelta: currentRegion.longitudeDelta * 2,
        };
        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 300);
    };

    const closeCallout = (markerId: string) => {
        console.log('Closing callout for marker:', markerId);
        if (markerRefs.current[markerId]) {
            markerRefs.current[markerId].hideCallout();
            setSelectedMarker(null);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Stack.Screen 
                options={{ 
                    title: params.title || 'Map View', 
                    headerTitleStyle: {
                        fontSize: 22,
                        fontFamily: 'Inter-Black',
                        color: '#1F3D2B',
                    },
                    headerBackButtonDisplayMode: 'minimal' 
                }} 
            />

            <View style={styles.container}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1F3D2B" />
                        <Text style={styles.loadingText}>Loading expenses...</Text>
                    </View>
                )}
                
                {error && (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.errorText}>Failed to load expenses</Text>
                        <Text style={styles.retryText} onPress={refetch}>Tap to retry</Text>
                    </View>
                )}
                
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={initialRegion}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    onRegionChangeComplete={(region) => setCurrentRegion(region)}
                >
                    {/* Render markers */}
                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            ref={(ref) => {
                                if (ref) {
                                    markerRefs.current[marker.id] = ref;
                                }
                            }}
                            coordinate={marker.coordinate}
                            pinColor={selectedMarker === marker.id ? '#1F3D2B' : '#DC2626'}
                            onPress={() => setSelectedMarker(marker.id)}
                            tracksViewChanges={false}
                        >
                            {marker.activityType === 'new_connectivity' ? 
                                <SignalMarker level={marker.secondary_item?.meta?.strength} /> 
                                : null
                            }

                            <Callout tooltip style={styles.callout}>
                                <View style={styles.calloutContentWrapper}>
                                    <MarkerCallout marker={marker} activityType={marker.activityType} />
                                    
                                    {/* Close Button */}
                                    <TouchableOpacity 
                                        onPress={() => closeCallout(marker.id)}
                                        style={styles.closeButton}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialCommunityIcons name="close" size={16} color="#6B7280" />
                                        <NText style={styles.closeButtonText}>Close</NText>
                                    </TouchableOpacity>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>

                {/* Zoom Controls */}
                <YStack style={styles.zoomControls} gap="$2">
                    <Button
                        size="$3"
                        circular
                        onPress={zoomIn}
                        bg="#1F3D2B"
                        icon={<MaterialCommunityIcons name="plus" size={20} color="white" />}
                    />
                    <Button
                        size="$3"
                        circular
                        onPress={zoomOut}
                        bg="#1F3D2B"
                        icon={<MaterialCommunityIcons name="minus" size={20} color="white" />}
                    />
                </YStack>

                {/* Info Panel */}
                <View style={styles.infoPanel}>
                    <View style={styles.infoPanelContent}>
                        <MaterialCommunityIcons name="information" size={16} color="#1F3D2B" />
                        <Text style={styles.infoText}>
                            {markers.length} marker{markers.length !== 1 ? 's' : ''} • Tap marker for details
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default MapViewScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
    zoomControls: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    callout: {
        width: 260,
        zIndex: 99999,
    },
    calloutContentWrapper: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 0,
        minWidth: 260,
    },
    calloutContent: {
        gap: 0,
        padding: 8,
        width: '100%',
    },
    calloutTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Black',
        color: '#1F3D2B',
        marginBottom: 4,
    },
    calloutDescription: {
        fontSize: 13,
        fontFamily: 'Inter',
        color: '#6B7280',
        marginBottom: 2,
    },
    calloutPrice: {
        fontSize: 14,
        fontFamily: 'Inter-Black',
        color: '#059669',
    },
    infoPanel: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    infoPanelContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        fontFamily: 'Inter',
        color: '#1F3D2B',
        textAlign: 'center',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 1000,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        fontFamily: 'Inter',
        color: '#1F3D2B',
    },
    errorText: {
        fontSize: 16,
        fontFamily: 'Inter-Black',
        color: '#DC2626',
    },
    retryText: {
        fontSize: 14,
        fontFamily: 'Inter',
        color: '#1F3D2B',
        textDecorationLine: 'underline',
        marginTop: 8,
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    closeButtonText: {
        fontSize: 13,
        fontFamily: 'Inter',
        color: '#6B7280',
    },
});