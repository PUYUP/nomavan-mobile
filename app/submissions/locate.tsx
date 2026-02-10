import { getCurrentLocation, reverseGeocodeLocation } from '@/services/location';
import { RouteContextPayload, useCreateRouteContextMutation } from '@/services/route-context';
import { RoutePointPayload, useCreateRoutePointMutation } from '@/services/route-point';
import { LocationSelection, subscribeLocationSelected } from '@/utils/location-selector';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

const LocateSubmission = () => {
    const router = useRouter();
    const [nextLocation, setNextLocation] = React.useState<LocationSelection>();
    const [currentLocation, setCurrentLocation] = React.useState<LocationSelection>();
    const [previousLocation, setPreviousLocation] = React.useState<LocationSelection>();
    const [currentDistanceFromPrev, setCurrentDistanceFromPrev] = React.useState<number>();
    const [nextDistanceFromCurrent, setNextDistanceFromCurrent] = React.useState<number>();
    const [createRouteContext, { isLoading: createContextLoading }] = useCreateRouteContextMutation({ fixedCacheKey: 'create-route-context-process' });
    const [createRoutePoint, { isLoading: createPointLoading }] = useCreateRoutePointMutation({ fixedCacheKey: 'create-route-point-process' });

    const refreshLocation = async (isArrived: boolean = false) => {
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
                        latitude: nextLocation?.latitude,
                        longitude: nextLocation?.longitude,
                    });
                } else {
                    setCurrentLocation({
                        placeName: placeName,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
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
                        latitude: isArrived && nextLocation?.latitude ? nextLocation?.latitude : coords.latitude,
                        longitude: isArrived && nextLocation?.longitude ? nextLocation?.longitude : coords.longitude,
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
                }

                if (isArrived) {
                    setNextLocation(undefined);
                }
            }
        }
    }

    useEffect(() => {
        const unsubscribeLocation = subscribeLocationSelected((selection) => {
            if (selection && selection.purpose === 'next-location') {
                setNextLocation(selection);
            }
        }, { emitLast: false });

        return () => {
            unsubscribeLocation();
        };
    }, []);

    useEffect(() => {
        const mounted = async () => {
            if (nextLocation) {
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
                        next_latitude: nextLocation?.latitude,
                        next_longitude: nextLocation?.longitude,
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
            }   
        }
        mounted();
    }, [nextLocation]);

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
                            <XStack style={styles.cardHeader}>
                                <XStack style={[styles.iconCircle, { backgroundColor: '#efbb11' }]}>
                                    <MaterialCommunityIcons name="map-marker-outline" size={28} color="#fff" />
                                </XStack>
                                <YStack width={'80%'}>
                                    <Text fontSize={12} opacity={0.7}>Previous</Text>
                                    <Text fontSize={14} numberOfLines={1} ellipsizeMode='tail'>
                                        {previousLocation ? previousLocation.placeName : 'Location history empty'}
                                    </Text>
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
                            <XStack style={styles.cardHeader}>
                                <XStack style={[styles.iconCircle, { backgroundColor: '#00bcd4' }]}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={28} color="#fff" />
                                </XStack>
                                <YStack width={'80%'}>
                                    <XStack style={{ justifyContent: 'space-between', marginBlockEnd: 2 }}>
                                        <Text fontSize={12} opacity={0.7}>Last update</Text>
                                        <Text fontSize={12} opacity={0.7}>2 hours ago</Text>
                                    </XStack>
                                    <Text fontSize={14} numberOfLines={1} ellipsizeMode='tail'>
                                        {currentLocation ? currentLocation.placeName : 'Where are you now?'}
                                    </Text>
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

                                        <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="timer-outline" size={16} color="#6b7280" />
                                            <Text fontSize={13} opacity={0.7}>Time spent: 1 day 12 h</Text>
                                        </XStack>
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
                            <XStack style={styles.cardHeader}>
                                <XStack style={[styles.iconCircle, { backgroundColor: '#ff817b' }]}>
                                    <MaterialCommunityIcons name="map-marker-path" size={28} color="#fff" />
                                </XStack>
                                <YStack width={'80%'}>
                                    <Text fontSize={12} opacity={0.7}>Next</Text>
                                    <Text fontSize={14} numberOfLines={1} ellipsizeMode='tail'>
                                        {nextLocation ? nextLocation.placeName : 'Where you want to go?'}
                                    </Text>
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
                                                <Text fontSize={13} opacity={0.7}>{nextLocation.longitude}</Text>
                                            </XStack>
                                        </XStack>
                                    
                                        <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="map-marker-distance" size={16} color="#6b7280" />
                                            <Text fontSize={13} opacity={0.7}>
                                                Distance: {nextDistanceFromCurrent || nextDistanceFromCurrent == 0 ? Math.round((nextDistanceFromCurrent / 1000) * 100) / 100 : '-'} km
                                            </Text>
                                        </XStack>

                                        <XStack style={styles.metaRow}>
                                            <MaterialCommunityIcons name="timer-outline" size={16} color="#6b7280" />
                                            <Text fontSize={13} opacity={0.7}>Time: ±10 hours</Text>
                                        </XStack>
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
