import { BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/activity';
import { getAuth } from '@/services/auth-storage';
import { getCurrentLocation, reverseGeocodeLocation } from '@/services/location';
import { RouteContextPayload, useCreateRouteContextMutation } from '@/services/route-context';
import { RoutePointPayload, useCreateRoutePointMutation } from '@/services/route-point';
import { LocationSelection, subscribeLocationSelected } from '@/utils/location-selector';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Button, Text, View, XStack, YStack } from 'tamagui';

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

const truncateCoordinate = (value: number, decimals: number = 8): number => {
    const multiplier = Math.pow(10, decimals);
    return Math.floor(value * multiplier) / multiplier;
};

interface LocationSelectionExtended extends LocationSelection {
    lastUpdated?: string;
}

const LocateSubmission = () => {
    const router = useRouter();
    const [userId, setUserId] = React.useState<number>();
    const [nextLocation, setNextLocation] = React.useState<LocationSelectionExtended>();
    const [currentLocation, setCurrentLocation] = React.useState<LocationSelectionExtended>();
    const [previousLocation, setPreviousLocation] = React.useState<LocationSelectionExtended>();
    const [currentDistanceFromPrev, setCurrentDistanceFromPrev] = React.useState<number>();
    const [nextDistanceFromCurrent, setNextDistanceFromCurrent] = React.useState<number>();
    const isLoadingFromAPI = useRef(false);
    const isRefreshingLocation = useRef(false);
    const { width } = useWindowDimensions();
    const htmlContentWidth = width - 100;

    const routeContextQueryArgs: BPActivityFilterArgs = {
        page: 1,
        per_page: 1,
        component: 'activity',
        type: ['new_route_context'],
        user_id: userId,
        secondary_item_meta_query: [
            { key: 'status', value: 'active' }
        ],
    }

    const routePointQueryArgs: BPActivityFilterArgs = {
        page: 1,
        per_page: 2,
        component: 'activity',
        type: ['new_route_point'],
        user_id: userId,
    }
    
    const [createRouteContext, { isLoading: createContextLoading }] = useCreateRouteContextMutation({ fixedCacheKey: 'create-route-context-process' });
    const [createRoutePoint, { isLoading: createPointLoading }] = useCreateRoutePointMutation({ fixedCacheKey: 'create-route-point-process' });
    const { 
        data: routeContextData, 
        isLoading: routeContextLoading, 
        error, 
        refetch: refetchRouteContext
    } = useGetActivitiesQuery(routeContextQueryArgs);

    const { 
        data: routePointData, 
        isLoading: routePointLoading, 
        refetch: refetchRoutePoint
    } = useGetActivitiesQuery(routePointQueryArgs);

    // Refetch data setiap kali screen di-focus
    useFocusEffect(
        useCallback(() => {
            refetchRouteContext();
            refetchRoutePoint();
        }, [])
    );

    // Get user_id from auth storage
    useEffect(() => {
        const fetchUserId = async () => {
            const auth = await getAuth();
            if (auth && auth.user && typeof auth.user.id === 'number') {
                setUserId(auth.user.id);
            }
        };
        fetchUserId();
    }, []);

    const refreshLocation = async (isArrived: boolean = false) => {
        isRefreshingLocation.current = true;
        const location = await getCurrentLocation();
        if (location.ok) {
            const coords = location.data.coords;
            const geocoded = await reverseGeocodeLocation(coords.latitude, coords.longitude);
            if (geocoded.ok) {
                const placeName = geocoded.data.name;

                // move current location to previous
                if (currentLocation) {
                    setPreviousLocation(currentLocation);

                    const distance = distanceInMeters(
                        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                        { latitude: coords.latitude, longitude: coords.longitude }
                    );

                    setCurrentDistanceFromPrev(distance);
                }
                
                if (isArrived && nextLocation) {
                    setCurrentLocation({
                        placeName: nextLocation?.placeName,
                        latitude: truncateCoordinate(nextLocation?.latitude),
                        longitude: truncateCoordinate(nextLocation?.longitude),
                        lastUpdated: new Date().toISOString(),
                    });
                } else {
                    setCurrentLocation({
                        placeName: placeName,
                        latitude: truncateCoordinate(coords.latitude),
                        longitude: truncateCoordinate(coords.longitude),
                        lastUpdated: new Date().toISOString(),
                    });
                }

                // calculate distance
                if (nextLocation) {
                    const distance = distanceInMeters(
                        { latitude: nextLocation.latitude, longitude: nextLocation.longitude },
                        { latitude: coords.latitude, longitude: coords.longitude }
                    );

                    setNextDistanceFromCurrent(distance);
                }

                const payload: RoutePointPayload = {
                    title: isArrived && nextLocation?.placeName ? nextLocation.placeName : placeName,
                    content: '',
                    status: 'publish',
                    meta: {
                        latitude: truncateCoordinate(isArrived && nextLocation?.latitude ? nextLocation?.latitude : coords.latitude),
                        longitude: truncateCoordinate(isArrived && nextLocation?.longitude ? nextLocation?.longitude : coords.longitude),
                        arrived_at: isArrived ? new Date().toISOString() : '',
                    }
                }
                const result = await createRoutePoint(payload);
                if (result && result.data) {
                    // router.back();
                    Toast.show({
                        type: 'success',
                        text1: 'Information',
                        text2: 'Your location updated successfully',
                    });
                    refetchRoutePoint();
                }

                if (isArrived) {
                    setNextLocation(undefined);
                }
            }
        }
        isRefreshingLocation.current = false;
    }

    useEffect(() => {
        const unsubscribeLocation = subscribeLocationSelected((selection) => {
            if (selection && selection.purpose === 'next-location') {
                isLoadingFromAPI.current = false;
                setNextLocation({
                    ...selection,
                    latitude: truncateCoordinate(selection.latitude),
                    longitude: truncateCoordinate(selection.longitude),
                });
            }
        }, { emitLast: false });

        return () => {
            unsubscribeLocation();
        };
    }, []);

    useEffect(() => {
        const mounted = async () => {
            // Only create route context if the location was set by user, not from API
            if (nextLocation && !isLoadingFromAPI.current) {
                // calculate distance
                if (currentLocation) {
                    const distance = distanceInMeters(
                        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                        { latitude: nextLocation?.latitude, longitude: nextLocation?.longitude }
                    );

                    setNextDistanceFromCurrent(distance);
                }

                const payload: RouteContextPayload = {
                    title: '',
                    content: '',
                    status: 'publish',
                    meta: {
                        next_latitude: truncateCoordinate(nextLocation?.latitude),
                        next_longitude: truncateCoordinate(nextLocation?.longitude),
                        next_place_name: nextLocation?.placeName,
                        started_at: new Date().toISOString(),
                    }
                }
                const result = await createRouteContext(payload);
                if (result && result.data) {
                    // router.back();
                    Toast.show({
                        type: 'success',
                        text1: 'Information',
                        text2: 'Destination saved successfully',
                    });
                }
            } else if (nextLocation && currentLocation) {
                // Just calculate distance if loaded from API
                const distance = distanceInMeters(
                    { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                    { latitude: nextLocation?.latitude, longitude: nextLocation?.longitude }
                );

                setNextDistanceFromCurrent(distance);
            }
        }
        mounted();
    }, [nextLocation]);

    useEffect(() => {
        const mounted = async () => {
            if (routeContextData && routeContextData.length > 0) {
                const latestContext = routeContextData[0];
                const meta = latestContext.secondary_item.meta;
                if (meta.next_latitude && meta.next_longitude && meta.next_place_name) {
                    isLoadingFromAPI.current = true;
                    setNextLocation({
                        latitude: truncateCoordinate(meta.next_latitude),
                        longitude: truncateCoordinate(meta.next_longitude),
                        placeName: meta.next_place_name,
                    });
                }
            }
        }
        mounted();
    }, [routeContextData]);

    useEffect(() => {
        const mounted = async () => {
            if (routePointData && routePointData.length > 0 && !isRefreshingLocation.current) {
                // Get the latest route point (current location)
                const latestPoint = routePointData[0];
                const meta = latestPoint.secondary_item.meta;
                if (meta.latitude && meta.longitude) {
                    console.log('Setting current location from API', meta.latitude, meta.longitude, latestPoint.secondary_item.title);
                    setCurrentLocation({
                        latitude: truncateCoordinate(meta.latitude),
                        longitude: truncateCoordinate(meta.longitude),
                        placeName: latestPoint.secondary_item.title.rendered,
                        lastUpdated: latestPoint.date,
                    });

                    // Get the second latest point (previous location)
                    if (routePointData.length > 1) {
                        const previousPoint = routePointData[0];
                        const prevMeta = previousPoint.secondary_item.meta;
                        if (prevMeta.latitude && prevMeta.longitude) {
                            setPreviousLocation({
                                latitude: truncateCoordinate(prevMeta.latitude),
                                longitude: truncateCoordinate(prevMeta.longitude),
                                placeName: previousPoint.secondary_item.title.rendered,
                                lastUpdated: previousPoint.date,
                            });

                            // Calculate distance between previous and current
                            const distance = distanceInMeters(
                                { latitude: prevMeta.latitude, longitude: prevMeta.longitude },
                                { latitude: meta.latitude, longitude: meta.longitude }
                            );
                            setCurrentDistanceFromPrev(distance);
                        }
                    }
                }
            }
        }
        mounted();
    }, [routePointData]);

	return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Stack.Screen 
                    options={{ 
                        title: 'Locate En-Route', 
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
                    <YStack paddingStart="$1" paddingEnd="$1" flex={1} gap="$4">
                        <YStack gap="$1" marginBlockEnd={0}>
                            <Text opacity={0.7}>Keep your vanlife location up to date and share it with fellow vanlifers.</Text>
                        </YStack>

                        <YStack style={styles.card} gap="$2">
                            <XStack style={[styles.cardHeader, { alignItems: previousLocation ? 'start' : 'center' }]}>
                                <XStack style={[styles.iconCircle, { backgroundColor: '#efbb11' }]}>
                                    <MaterialCommunityIcons name="map-marker-outline" size={28} color="#fff" />
                                </XStack>
                                <YStack width={'80%'}>
                                    <Text fontSize={12} opacity={0.7}>Previous</Text>
                                    {previousLocation ?
                                        <RenderHtml contentWidth={htmlContentWidth} source={{ html: previousLocation?.placeName ? previousLocation.placeName : '' }} />
                                        : <Text fontSize={14} numberOfLines={1}>Location history empty.</Text>
                                    }
                                </YStack>
                            </XStack>

                            {previousLocation ? 
                                <YStack paddingStart={12}>
                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#6b7280" />
                                        <XStack>
                                            <Text fontSize={13} opacity={0.7}>{previousLocation.latitude}</Text>
                                            <Text marginStart={1} marginEnd={3}>,</Text>
                                            <Text fontSize={13} opacity={0.7}>{previousLocation.longitude}</Text>
                                        </XStack>
                                    </XStack>
                                </YStack>
                                : null
                            }
                        </YStack>

                        <View style={styles.dashedArrowRow}>
                            <View style={styles.dashedLine} />
                                <View style={styles.arrow}>
                                    <MaterialCommunityIcons name="arrow-down" size={22} color="#1F3D2B" />
                                </View>

                                <Button size="$2" width={120} iconAfter={<MaterialCommunityIcons name="car-traction-control" size={14} />}>View route</Button>
                            <View style={styles.dashedLine} />
                        </View>

                        <YStack style={styles.card} gap="$2">
                            <XStack style={[styles.cardHeader, { alignItems: currentLocation ? 'start' : 'center' }]}>
                                <XStack style={[styles.iconCircle, { backgroundColor: '#00bcd4' }]}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={28} color="#fff" />
                                </XStack>
                                <YStack width={'80%'}>
                                    <XStack style={{ justifyContent: 'space-between', marginBlockEnd: 2 }}>
                                        <Text fontSize={12} opacity={0.7}>Current</Text>
                                        <Text fontSize={12} opacity={0.7}>
                                            {currentLocation?.lastUpdated ? formatDistanceToNow(new Date(currentLocation.lastUpdated || ''), { addSuffix: false, includeSeconds: true }) : null} 
                                        </Text>
                                    </XStack>

                                    {currentLocation ?
                                        <RenderHtml contentWidth={htmlContentWidth} source={{ html: currentLocation?.placeName ? currentLocation.placeName : '' }} />
                                        : <Text fontSize={14} numberOfLines={1}>Where are you now?</Text>
                                    }
                                    </YStack>
                            </XStack>

                            <XStack style={{ alignItems: 'flex-end' }}>
                                {currentLocation ?
                                    <YStack paddingStart={12} flex={1}>
                                        <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#6b7280" />
                                            <XStack>
                                                <Text fontSize={13} opacity={0.7}>{currentLocation.latitude}</Text>
                                                <Text marginStart={1} marginEnd={3}>,</Text>
                                                <Text fontSize={13} opacity={0.7}>{currentLocation.longitude}</Text>
                                            </XStack>
                                        </XStack>

                                        <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="map-marker-distance" size={16} color="#6b7280" />
                                            <Text fontSize={13} opacity={0.7}>
                                                From prev: {currentDistanceFromPrev || currentDistanceFromPrev == 0 ? Math.round((currentDistanceFromPrev / 1000) * 100) / 100 : '-'} km
                                            </Text>
                                        </XStack>

                                        {/* <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="timer-outline" size={16} color="#6b7280" />
                                            <Text fontSize={13} opacity={0.7}>Time spent: 1 day 12 h</Text>
                                        </XStack> */}
                                    </YStack>
                                    : null
                                }

                                <Button 
                                    size={currentLocation ? '$2' : '$4'}
                                    bg={currentLocation ? '$blue4' : '$blue4'}
                                    icon={<MaterialCommunityIcons name="refresh" size={20} />}
                                    style={currentLocation ? styles.actionButton : styles.setLocationButton}
                                    marginBlockStart={currentLocation ? 0 : 8}
                                    onPress={async () => await refreshLocation()}
                                >
                                    Refresh
                                </Button>
                            </XStack>
                        </YStack>

                        <View style={styles.dashedArrowRow}>
                            <View style={styles.dashedLine} />
                            <View style={styles.arrow}>
                                <MaterialCommunityIcons name="arrow-down" size={22} color="#1F3D2B" />
                            </View>
                            <Button size="$2" width={120} iconAfter={<MaterialCommunityIcons name="car-traction-control" size={14} />}>View route</Button>
                            <View style={styles.dashedLine} />
                        </View>

                        <YStack style={styles.card} gap="$2">
                            <XStack style={[styles.cardHeader, { alignItems: nextLocation ? 'start' : 'center' }]}>
                                <XStack style={[styles.iconCircle, { backgroundColor: '#ff817b' }]}>
                                    <MaterialCommunityIcons name="map-marker-path" size={28} color="#fff" />
                                </XStack>
                                <YStack width={'80%'}>
                                    <Text fontSize={12} opacity={0.7}>Next</Text>
                                    {nextLocation ?
                                        <RenderHtml contentWidth={htmlContentWidth} source={{ html: nextLocation?.placeName ? nextLocation.placeName : '' }} />
                                        : <Text fontSize={14} numberOfLines={1}>Where you want to go?</Text>
                                    }
                                </YStack>
                            </XStack>

                            <XStack style={{ alignItems: 'flex-end' }}>
                                {nextLocation ?
                                    <YStack paddingStart={12} flex={1}>
                                        <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#6b7280" />
                                            <XStack>
                                                <Text fontSize={13} opacity={0.7}>{nextLocation.latitude}</Text>
                                                <Text marginStart={1} marginEnd={3}>,</Text>
                                                <Text fontSize={13} opacity={0.7} numberOfLines={1}>{nextLocation.longitude}</Text>
                                            </XStack>
                                        </XStack>
                                    
                                        <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="map-marker-distance" size={16} color="#6b7280" />
                                            <Text fontSize={13} opacity={0.7}>
                                                Distance: {nextDistanceFromCurrent || nextDistanceFromCurrent == 0 ? Math.round((nextDistanceFromCurrent / 1000) * 100) / 100 : '-'} km
                                            </Text>
                                        </XStack>

                                        {/* <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="timer-outline" size={16} color="#6b7280" />
                                            <Text fontSize={13} opacity={0.7}>Time: ±10 hours</Text>
                                        </XStack> */}
                                    </YStack>
                                    : null
                                }

                                <Button 
                                    size={nextLocation ? '$2' : '$4'}
                                    bg={nextLocation ? '$blue4' : '$blue4'}
                                    icon={<MaterialCommunityIcons name="map-marker-radius-outline" size={20} />}
                                    style={nextLocation ? styles.actionButton : styles.setLocationButton}
                                    marginBlockStart={nextLocation ? 0 : 8}
                                    onPress={() => router.push({
                                        pathname: '/modals/map',
                                        params: {
                                            purpose: 'next-location',
                                            place_name: nextLocation?.placeName,
                                            initialLat: nextLocation?.latitude,
                                            initialLng: nextLocation?.longitude,
                                        }
                                    })}
                                >
                                    {nextLocation ? 'Change' : 'Set Destination'}
                                </Button>
                            </XStack>
                            
                            {nextLocation && currentLocation ?
                                <Button 
                                    size={'$4'}
                                    bg={'$blue4'}
                                    icon={<MaterialCommunityIcons name="map-marker-radius-outline" size={20} />}
                                    marginBlockStart={8}
                                    onPress={() => refreshLocation(true)}
                                >
                                    Arrived!
                                </Button>
                                : null
                            }
                        </YStack>
                    </YStack>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </>
	);
}

export default LocateSubmission;

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
	card: {
		backgroundColor: '#f8fafc',
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	cardHeader: {
		alignItems: 'center',
		gap: 8,
	},
	iconCircle: {
		height: 42,
		width: 42,
		borderRadius: 42,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#eef2ff',
	},
	rowBetween: {
		justifyContent: 'space-between',
	},
	metaRow: {
		alignItems: 'center',
		gap: 6,
        marginTop: 4,
	},
	dashedArrowRow: {
		flexDirection: 'row',
		alignItems: 'center',
        justifyContent: 'space-between',
		gap: 8,
		marginVertical: 0,
	},
	dashedLine: {
		flex: 1,
		borderBottomWidth: 1,
		borderStyle: 'dashed',
		borderColor: '#cbd5e1',
	},
    arrow: {
        backgroundColor: '#eef2ff',
        borderRadius: 34,
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetClose: {
        position: 'absolute',
        top: 8,
        right: 8,
        height: 32,
        width: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2f2f2',
        zIndex: 10,
    },
    currentLocation: {
        backgroundColor: '#fff',
        padding: 16,
        width: '100%',
    },
    actionButton: {
        backgroundColor: '#eef2ff',
    },
    setLocationButton: {
        width: '100%',
    }
});
