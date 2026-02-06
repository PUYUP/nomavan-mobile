import { getCurrentLocation, reverseGeocodeLocation } from '@/services/location-service';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LocationGeocodedAddress } from 'expo-location';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Sheet, Text, View, XStack, YStack } from 'tamagui';

const LocateSubmission = () => {
    const [editorOpen, setEditorOpen] = useState<boolean>(false);
    const [position, setPosition] = React.useState(0);
    const [location, setLocation] = React.useState(null);
    const [locationName, setLocationName] = React.useState('');
    const [address, setAddress] = React.useState<LocationGeocodedAddress>();

    useEffect(() => {
        const onMount = async () => {
            if (editorOpen) {
                const location = await getCurrentLocation();
                if (location.ok) {
                    const coords = location.data.coords;
                    const geocoded = await reverseGeocodeLocation(coords.latitude, coords.longitude);
                    if (geocoded.ok) {
                        setLocationName(geocoded.data.name);
                        setAddress(geocoded.data.details);
                    }
                }
            }
        }
        onMount();
    }, [editorOpen]);

    useEffect(() => {
        if (!editorOpen) {
            return;
        }

        const onBackPress = () => {
            setEditorOpen(false);
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [editorOpen]);

    const refreshLocation = async () => {
        const location = await getCurrentLocation();
        if (location.ok) {
            const coords = location.data.coords;
            const geocoded = await reverseGeocodeLocation(coords.latitude, coords.longitude);
            if (geocoded.ok) {
                setLocationName(geocoded.data.name);
                setAddress(geocoded.data.details);
            }
        }
    }

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
                    <YStack paddingStart="$4" paddingEnd="$4" flex={1} gap="$3">
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
                                    <Text fontSize={14} numberOfLines={1} ellipsizeMode='tail'>Beaver Meadow Falls</Text>
                                </YStack>
                            </XStack>

                            <YStack paddingStart={12}>
                                <XStack style={styles.metaRow}>
                                    <MaterialCommunityIcons name="latitude" size={16} color="#6b7280" />
                                    <Text fontSize={13} opacity={0.7}>Lat: -190.303636</Text>
                                </XStack>
                                <XStack style={[styles.metaRow, { marginTop: 4 }]}>
                                    <MaterialCommunityIcons name="longitude" size={16} color="#6b7280" />
                                    <Text fontSize={13} opacity={0.7}>Lng: 0.356626</Text>
                                </XStack>
                            </YStack>
                        </YStack>

                        <View style={styles.dashedArrowRow}>
                            <View style={styles.dashedLine} />
                                <View style={styles.arrow}>
                                    <MaterialCommunityIcons name="arrow-down" size={22} color="#1F3D2B" />
                                </View>

                                <Button size="$2" width={120} iconAfter={<MaterialCommunityIcons name="car-traction-control" size={14} />}>View track</Button>
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
                                    <Text fontSize={14} numberOfLines={1} ellipsizeMode='tail'>Pictured Rocks National Lakeshore</Text>
                                </YStack>
                            </XStack>

                            <XStack style={{ alignItems: 'flex-end' }}>
                                <YStack paddingStart={12} flex={1}>
                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="latitude" size={16} color="#6b7280" />
                                        <Text fontSize={13} opacity={0.7}>Lat: -140.303636</Text>
                                    </XStack>

                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="longitude" size={16} color="#6b7280" />
                                        <Text fontSize={13} opacity={0.7}>Lng:  0.146626</Text>
                                    </XStack>
                                
                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="map-marker-distance" size={16} color="#6b7280" />
                                        <Text fontSize={13} opacity={0.7}>From prev: 10.3 km</Text>
                                    </XStack>

                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="timer-outline" size={16} color="#6b7280" />
                                        <Text fontSize={13} opacity={0.7}>Time spent: 1 day 12 h</Text>
                                    </XStack>
                                </YStack>

                                <Button 
                                    size="$2" 
                                    icon={<MaterialCommunityIcons name="refresh" size={20} />}
                                    style={styles.actionButton}
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
                            <Button size="$2" width={120} iconAfter={<MaterialCommunityIcons name="car-traction-control" size={14} />}>View track</Button>
                            <View style={styles.dashedLine} />
                        </View>

                        <YStack style={styles.card} gap="$2">
                            <XStack style={styles.cardHeader}>
                                <XStack style={[styles.iconCircle, { backgroundColor: '#ff817b' }]}>
                                    <MaterialCommunityIcons name="map-marker-path" size={28} color="#fff" />
                                </XStack>
                                <YStack width={'80%'}>
                                    <Text fontSize={12} opacity={0.7}>Next</Text>
                                    <Text fontSize={14} numberOfLines={1} ellipsizeMode='tail'>Palisade Point</Text>
                                </YStack>
                            </XStack>

                            <XStack style={{ alignItems: 'flex-end' }}>
                                <YStack paddingStart={12} flex={1}>
                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="latitude" size={16} color="#6b7280" />
                                        <Text fontSize={13} opacity={0.7}>Lat: -140.303636</Text>
                                    </XStack>

                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="longitude" size={16} color="#6b7280" />
                                        <Text fontSize={13} opacity={0.7}>Lng:  0.146626</Text>
                                    </XStack>
                                
                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="map-marker-distance" size={16} color="#6b7280" />
                                        <Text fontSize={13} opacity={0.7}>Distance: ±7.8 km</Text>
                                    </XStack>

                                    <XStack style={styles.metaRow}>
                                        <MaterialCommunityIcons name="timer-outline" size={16} color="#6b7280" />
                                        <Text fontSize={13} opacity={0.7}>Time: ±10 hours</Text>
                                    </XStack>
                                </YStack>

                                <Button 
                                    size="$2" 
                                    icon={<MaterialCommunityIcons 
                                    name="file-document-edit-outline" size={20} />}
                                    style={styles.actionButton}
                                >
                                    Change
                                </Button>
                            </XStack>
                        </YStack>
                    </YStack>
                </KeyboardAwareScrollView>

                {/* <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                    <XStack style={{ justifyContent: 'stretch', gap: 16 }}>
                        <View style={{ flex: 1 }}>
                            <Button onPress={async () => refreshLocation()}>
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={20} />
                                <Text>Refresh</Text>
                            </Button>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Button onPress={async () => setEditorOpen(true)} style={{ backgroundColor: '#00bcd4', width: '100%' }}>
                                <MaterialCommunityIcons name="map-marker-path" size={20} color={'#fff'} />
                                <Text color={'#fff'}>Locate</Text>
                            </Button>
                        </View>
                    </XStack>
                </View> */}
            </SafeAreaView>

            <Sheet
                modal={true}
                open={editorOpen}
                onOpenChange={setEditorOpen}
                snapPoints={[85]}
                snapPointsMode={'percent'}
                dismissOnSnapToBottom
                position={position}
                onPositionChange={setPosition}
                zIndex={100_000}
                transition="medium"
            >
                <Sheet.Overlay
                    transition="fast"
                    bg="$shadow6"
                    enterStyle={{ opacity: 0 }}
                    exitStyle={{ opacity: 0 }}
                />

                <Sheet.Frame p="$4" justify="center" items="center" gap="$5">
                    <Button
                        unstyled
                        style={styles.sheetClose}
                        pressStyle={{ opacity: 0.7 }}
                        accessibilityLabel="Close"
                        onPress={async () => setEditorOpen(false)}
                    >
                        <MaterialCommunityIcons name="close" size={22} />
                    </Button>

                    <Card style={styles.currentLocation}>
                        <YStack style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="map-marker-radius" size={60} color={'#E53935'} />
                            <Text marginBlockStart="$1" opacity={0.75}>You are here</Text>
                            <Text marginBlockStart="$3" fontSize="$4" style={{ textAlign: 'center' }}>{locationName}</Text>
                        </YStack>
                    </Card>

                    <Card>
                        {/*'map view here'*/}
                    </Card>
                </Sheet.Frame>
            </Sheet>
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
    }
});
