import { SpothuntPayload, useCreateSpothuntMutation } from '@/services/apis/spothunt-api';
import { getCurrentLocation, reverseGeocodeLocation } from '@/services/location';
import { MediaUploadPayload, useUploadMediaMutation } from '@/services/media';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Animated, Image, Platform, Pressable, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MapView, { Region } from 'react-native-maps';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Text, TextArea, View, XStack, YStack } from "tamagui";

export interface Marker {
    title: string;
    content: string;
    lat: number;
	lng: number;
}

const AddPinSubmission = () => {
    const router = useRouter();
    const initialDelta = 0.0015;
    const { handleSubmit, control, setValue, reset } = useForm<Marker>();
    const [region, setRegion] = useState<Region | null>(null);
    const [centerCoords, setCenterCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [placeName, setPlaceName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    type PovImage = {
        id: number;
        uri: string;
        clientId: string;
        uploading?: boolean;
    };
    const [povImages, setPovImages] = useState<PovImage[]>([]);
    const pinScale = useRef(new Animated.Value(1)).current;
    const mapRef = useRef<MapView | null>(null);
    const lastRegionRef = useRef<Region | null>(null);
    const originalCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const isRevertingRef = useRef(false);
    const isDraggingRef = useRef(false);
    const hasInitialized = useRef(false);
    const [submitSpothunt, { isLoading: submitSpothuntLoading }] = useCreateSpothuntMutation();
    const [uploadMdia, { isLoading: uploadMediaLoading }] = useUploadMediaMutation();
    
    const onSubmit: SubmitHandler<Marker> = async (data) => {
        const payload: SpothuntPayload = {
            content: data.content,
            title: data.title,
            status: 'publish',
            meta: {
                latitude: centerCoords?.latitude,
                longitude: centerCoords?.longitude,
                place_name: placeName,
                gallery: povImages.filter((item) => item.id > 0).map((item) => item.id),
            }
        };
        const result = await submitSpothunt(payload);
        console.log('Spothunt submission result:', result);
        if (result && result.data) {
            router.back();
        }
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
                    setPlaceName(geocoded.data.name);
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
            setPlaceName(geocoded.data.name);
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
                alert('Pin must be within 100 meters of your current location.');
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

    const createClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pickImage = async (index: number) => {
        Alert.alert('Add photo', 'Choose a source', [
            {
                text: 'Take photo',
                onPress: async () => {
                    const permission = await ImagePicker.requestCameraPermissionsAsync();
                    if (!permission.granted) {
                        Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
                        return;
                    }
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    });
                    if (!result.canceled && result.assets?.[0]?.uri) {
                        const uri = result.assets[0].uri;
                        let clientId: string;
                        setPovImages((prev) => {
                            const next = [...prev];
                            if (index < next.length) {
                                clientId = next[index].clientId;
                                next[index] = { ...next[index], uri, id: 0, uploading: true };
                            } else {
                                clientId = createClientId();
                                next.push({ id: 0, uri, clientId, uploading: true });
                            }
                            // Immediately start upload after state update
                            setTimeout(() => handleUploadImages(uri, clientId), 0);
                            return next;
                        });
                    }
                },
            },
            {
                text: 'Choose from library',
                onPress: async () => {
                    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permission.granted) {
                        Alert.alert('Permission required', 'Media library permission is needed to select a photo.');
                        return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    });
                    if (!result.canceled && result.assets?.[0]?.uri) {
                        const uri = result.assets[0].uri;
                        let clientId: string;
                        setPovImages((prev) => {
                            const next = [...prev];
                            if (index < next.length) {
                                clientId = next[index].clientId;
                                next[index] = { ...next[index], uri, id: 0, uploading: true };
                            } else {
                                clientId = createClientId();
                                next.push({ id: 0, uri, clientId, uploading: true });
                            }
                            setTimeout(() => handleUploadImages(uri, clientId), 0);
                            return next;
                        });
                    }
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleUploadImages = async (uri: string, clientId: string) => {
        try {
            const payload: MediaUploadPayload = {
                file: uri,
            };
            const result = await uploadMdia(payload);
            if (result && result.data && typeof result.data.id === 'number' && result.data.id > 0) {
                setPovImages((prev) =>
                    prev.map((item) =>
                        item.clientId === clientId
                            ? { ...item, id: result.data.id, uploading: false }
                            : item
                    )
                );
            } else {
                const errorMessage = (result?.error as any)?.data?.message;
                if (errorMessage) {
                    Alert.alert(errorMessage);
                }
                setPovImages((prev) => prev.filter((item) => item.clientId !== clientId));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Upload failed', 'Failed to upload the image. Please try again.');
            setPovImages((prev) => prev.filter((item) => item.clientId !== clientId));
        }
    };

    const removeImage = (clientId: string) => {
        setPovImages((prev) => prev.filter((item) => item.clientId !== clientId));
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Stack.Screen 
                options={{ 
                    title: 'Spot Hunt Pin', 
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
                        <XStack style={[styles.metaRow, { flex: 1, paddingEnd: 16 }]}>
                            <MaterialCommunityIcons name="map-marker-radius-outline" size={26} color="#6b7280" />
                            <Text fontSize={13}>{placeName ? placeName : '-'}</Text>
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
                
                    <XStack style={styles.povGrid}>
                        {povImages.map((item, index) => (
                            <Pressable key={item.clientId} style={styles.povTile} onPress={() => pickImage(index)}>
                                <Image source={{ uri: item.uri }} style={styles.povImage} />
                                {item.uploading ? (
                                    <View style={styles.povUploading}>
                                        <ActivityIndicator color="#111827" />
                                    </View>
                                ) : null}
                                <Pressable style={styles.povRemove} onPress={() => removeImage(item.clientId)}>
                                    <MaterialCommunityIcons name="close" size={14} color="#111827" />
                                </Pressable>
                                {item.id > 0 ? (
                                    <View style={styles.povIdBadge}>
                                        <Text fontSize={10} color="#111827">#{item.id}</Text>
                                    </View>
                                ) : null}
                            </Pressable>
                        ))}
                        <Pressable style={styles.povTile} onPress={() => pickImage(povImages.length)}>
                            <View style={styles.povContent}>
                                <MaterialCommunityIcons name="plus" size={22} color="#6b7280" />
                                <Text fontSize={12} opacity={0.7}>Add</Text>
                            </View>
                        </Pressable>
                    </XStack>

                    <YStack gap="$3">
                        <Controller
                            control={control}
                            name={'title'}
                            rules={{ required: false }}
                            render={({ field: { onChange, value } }) => (
                                <XStack style={styles.inputStack}>
                                    <Input
                                        onChangeText={onChange}
                                        value={value}
                                        flex={1}
                                        placeholder={'Spot name'}
                                        autoCapitalize="none"
                                        autoComplete="off"
                                        spellCheck={false}
                                        autoCorrect={false}
                                    />
                                </XStack>
                            )}
                        />

                        <Controller
                            control={control}
                            name={'content'}
                            rules={{ required: false }}
                            render={({ field: { onChange, value } }) => (
                                <TextArea onChange={onChange} size="$3" placeholder="Description…" rows={4} value={value} />
                            )}
                        />
                    </YStack>
                </YStack>
            </KeyboardAwareScrollView>

            <View style={{ marginTop: 'auto', paddingHorizontal: 16, paddingBlockEnd: 6, paddingBlockStart: 16 }}>
                <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton} disabled={submitSpothuntLoading ? true : false}>
                    {submitSpothuntLoading ? <ActivityIndicator color={'#fff'} /> : null}
                    <Text color={'white'} fontSize={20}>Set Pin</Text>
                </Button>
            </View>
        </SafeAreaView>
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
    povGrid: {
        marginTop: 6,
        marginBottom: 6,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        columnGap: 12,
        rowGap: 12,
    },
    povTile: {
        width: '31%',
        aspectRatio: 16 / 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
    },
    povContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    povImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    povUploading: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    povRemove: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    povIdBadge: {
        position: 'absolute',
        left: 6,
        bottom: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    inputStack: {
		alignItems: 'center',
	},
})