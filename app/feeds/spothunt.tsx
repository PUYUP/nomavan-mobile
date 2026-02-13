import { useGetActivityQuery } from '@/services/apis/activity-api';
import { Calendar, MapPin, MapPinned, User } from '@tamagui/lucide-icons';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Avatar, Button, Card, Text, View, XStack, YStack } from 'tamagui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 32; // padding 16 on each side

const SpotHuntFeed = () => {
    const { id } = useLocalSearchParams();
    const activityId = typeof id === 'string' ? parseInt(id, 10) : undefined;
    
    const { data: activity, isLoading, error } = useGetActivityQuery(activityId!, {
        skip: !activityId,
    });

    const [activityData, setActivityData] = useState<any>(null);
    const [isCheckingLocation, setIsCheckingLocation] = useState(false);

    useEffect(() => {
        if (activity && Array.isArray(activity) && activity.length > 0) {
            setActivityData(activity[0]);
        }
    }, [activity]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
    };

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    const handleImHere = async () => {
        if (!activityData?.secondary_item?.meta) return;

        setIsCheckingLocation(true);

        try {
            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to check in at this spot.'
                );
                setIsCheckingLocation(false);
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const userLat = location.coords.latitude;
            const userLng = location.coords.longitude;
            const spotLat = activityData.secondary_item.meta.latitude;
            const spotLng = activityData.secondary_item.meta.longitude;

            // Calculate distance
            const distance = calculateDistance(userLat, userLng, spotLat, spotLng);

            console.log('Distance from spot:', distance, 'meters');

            if (distance > 50) {
                Toast.show({
                    type: 'error',
                    text1: 'Too Far Away',
                    text2: `You must be within 50 meters of this spot. You are ${Math.round(distance)} meters away.`,
                    visibilityTime: 4000,
                });
            } else {
                Toast.show({
                    type: 'success',
                    text1: "You're at the spot!",
                    text2: `Distance: ${Math.round(distance)} meters`,
                    visibilityTime: 3000,
                });
                // TODO: Call API to record check-in
                console.log('User checked in at spot:', activityData.id);
            }
        } catch (error) {
            console.error('Error checking location:', error);
            Alert.alert('Error', 'Failed to get your current location. Please try again.');
        } finally {
            setIsCheckingLocation(false);
        }
    };
    
    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: 'Spot Hunt',
                    headerBackButtonDisplayMode: 'minimal',
                    headerTitleStyle: {
                        fontSize: 22,
                        fontFamily: 'Inter-Black',
                        color: '#1F3D2B',
                    },
                    headerRight: () => {
                        const photoCount = activityData?.secondary_item?.meta?.gallery?.length || 0;
                        if (photoCount === 0) return null;
                        return (
                            <View paddingRight="$3">
                                <Text fontSize="$3" color="$gray11" fontWeight="600">
                                    {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                                </Text>
                            </View>
                        );
                    },
                }}
            />

            <ScrollView>
                {isLoading ? (
                    <YStack alignItems="center" paddingTop="$4" gap="$2">
                        <ActivityIndicator />
                        <Text opacity={0.7}>Loading spot...</Text>
                    </YStack>
                ) : error ? (
                    <YStack alignItems="center" paddingTop="$4" gap="$2">
                        <Text color="$red10">Failed to load spot.</Text>
                    </YStack>
                ) : activityData ? (
                    <YStack>
                        {/* Gallery Images */}
                        {activityData.secondary_item?.meta?.gallery && 
                         activityData.secondary_item.meta.gallery.length > 0 && (
                            activityData.secondary_item.meta.gallery.length === 1 ? (
                                // Single image - centered
                                <View paddingTop="$4" paddingHorizontal="$4" alignItems="center">
                                    <Image
                                        source={{ uri: activityData.secondary_item.meta.gallery[0].full_url }}
                                        style={{
                                            width: IMAGE_WIDTH,
                                            height: IMAGE_WIDTH * 0.75,
                                            borderRadius: 12,
                                        }}
                                        resizeMode="cover"
                                    />
                                </View>
                            ) : (
                                // Multiple images - horizontal scroll
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    pagingEnabled
                                    decelerationRate="fast"
                                    style={{ paddingTop: 16 }}
                                >
                                    {activityData.secondary_item.meta.gallery.map((img: any, index: number) => (
                                        <View key={img.id || index} width={IMAGE_WIDTH} marginHorizontal="$2">
                                            <Image
                                                source={{ uri: img.full_url }}
                                                style={{
                                                    width: IMAGE_WIDTH,
                                                    height: IMAGE_WIDTH * 0.75,
                                                    borderRadius: 12,
                                                }}
                                                resizeMode="cover"
                                            />
                                        </View>
                                    ))}
                                </ScrollView>
                            )
                        )}

                        {/* Spot Details */}
                        <YStack padding="$4" gap="$3">
                            {/* Title */}
                            {activityData.secondary_item?.title?.rendered && (
                                <Text fontSize="$4" color="$gray12">
                                    {activityData.secondary_item.title.rendered
                                        .replace(/<[^>]*>/g, '')
                                        .replace(/&#8211;/g, '–')
                                        .replace(/&#8217;/g, "'")}
                                </Text>
                            )}

                            {/* I'm Here Button */}
                            <Button
                                size="$5"
                                theme="green"
                                backgroundColor="$green9"
                                borderRadius="$4"
                                pressStyle={{ backgroundColor: '$green10', scale: 0.98 }}
                                icon={<MapPinned size={20} color="white" />}
                                onPress={handleImHere}
                                disabled={isCheckingLocation}
                                opacity={isCheckingLocation ? 0.6 : 1}
                            >
                                <Text color="white" fontSize="$5" fontWeight="700">
                                    {isCheckingLocation ? 'Checking...' : "I'm Here"}
                                </Text>
                            </Button>

                            {/* Location Info */}
                            {activityData.secondary_item?.meta?.place_name && (
                                <Card padding="$4" backgroundColor="white" borderRadius="$4">
                                    <XStack gap="$3" alignItems="flex-start">
                                        <MapPin size={20} color="$green10" style={{ marginTop: 2 }} />
                                        <YStack flex={1} gap="$2">
                                            <Text fontSize="$3" color="$gray11" lineHeight="$1">
                                                {activityData.secondary_item.meta.place_name}
                                            </Text>
                                            <XStack gap="$4" marginTop="$2">
                                                <Text fontSize="$2" color="$gray10">
                                                    Lat: {activityData.secondary_item.meta.latitude.toFixed(6)}
                                                </Text>
                                                <Text fontSize="$2" color="$gray10">
                                                    Lng: {activityData.secondary_item.meta.longitude.toFixed(6)}
                                                </Text>
                                            </XStack>
                                        </YStack>
                                    </XStack>
                                </Card>
                            )}

                            {/* User Info */}
                            <Card padding="$3" backgroundColor="white" borderRadius="$4">
                                <XStack alignItems="center" gap="$3">
                                    <Avatar circular size="$4">
                                        <Avatar.Image src={`https:${activityData.user_avatar?.thumb}`} />
                                        <Avatar.Fallback backgroundColor="$gray5">
                                            <User size={14} />
                                        </Avatar.Fallback>
                                    </Avatar>
                                    <YStack flex={1}>
                                        <Text fontSize="$4" fontWeight="600" color="$gray12">
                                            {activityData.user_profile?.name}
                                        </Text>
                                        <XStack gap="$2" marginBlockStart="$1.5" alignItems="center">
                                            <Calendar size={12} color="$gray10" />
                                            <Text fontSize="$2" color="$gray10">
                                                {new Date(activityData.date).toLocaleString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </XStack>
                                    </YStack>
                                </XStack>
                            </Card>
                        </YStack>
                    </YStack>
                ) : (
                    <YStack alignItems="center" paddingTop="$4" gap="$2">
                        <Text opacity={0.7}>No spot found.</Text>
                    </YStack>
                )}
            </ScrollView>
        </>
    )
};

export default SpotHuntFeed;