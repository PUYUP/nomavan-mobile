import { BPActivityResponse } from '@/services/activity';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";

type SpotHuntPinProps = {
    activity?: BPActivityResponse | null
    userLat?: number | null
    userLng?: number | null

    title?: string
    visitorsLabel?: string
    viewPinLabel?: string
    contributorMeta?: string
    PinsAddedLabel?: string
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();
const haversineDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRadians = (value: number) => (value * Math.PI) / 180
    const earthRadiusMeters = 6371000
    const deltaLat = toRadians(lat2 - lat1)
    const deltaLon = toRadians(lon2 - lon1)
    const a = Math.sin(deltaLat / 2) ** 2
        + Math.cos(toRadians(lat1))
        * Math.cos(toRadians(lat2))
        * Math.sin(deltaLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return earthRadiusMeters * c
}

const SpotHuntPin = ({
    activity = null,
    userLat = null,
    userLng = null,
    visitorsLabel = '10 were here',
    viewPinLabel = 'View Spot',
    contributorMeta = '634 spots',
    PinsAddedLabel = 'hunted 2h ago',
}: SpotHuntPinProps) => {
    if (!activity) {
        return null;
    }

    const router = useRouter();
    const coordinates = activity.secondary_item.meta.latitude + ', ' + activity.secondary_item.meta.longitude;
    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';
    const placeLabel = activity.secondary_item.meta.place_name ? activity.secondary_item.meta.place_name : null;
    const gallery = activity.secondary_item?.meta?.gallery ?? [];
    const extraPhotos = Math.max(0, gallery.length - 3);
    const morePhotosLabel = extraPhotos > 0 ? `+${extraPhotos}` : '';
    const rawTitle = activity.secondary_item.title.rendered ? stripHtml(activity.secondary_item.title.rendered) : 'New Pin Dropped';
    const title = rawTitle.replace(/\s+by\s+.+$/i, '').trim();
    const [distanceMeters, setDistanceMeters] = useState<number | null>(null)
    
    const handleOpenDirections = (item: BPActivityResponse | null) => {
        if (1 > 0) {
            router.push({
                pathname: '/feeds/spothunt',
                params: {
                    id: item?.id,
                }
            });
            return;
        }

        const latitude = item?.secondary_item?.meta?.latitude;
        const longitude = item?.secondary_item?.meta?.longitude;

        if (!latitude || !longitude) return

        const query = encodeURIComponent(`${latitude},${longitude}`)
        const label = encodeURIComponent(item?.secondary_item?.meta?.place_name)
        const url = Platform.OS === 'ios'
            ? `http://maps.apple.com/?ll=${query}&q=${label}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`

        Linking.openURL(url)
    }

    useEffect(() => {
        const latRaw = activity?.secondary_item?.meta?.latitude
        const lngRaw = activity?.secondary_item?.meta?.longitude
        const latitude = latRaw !== undefined ? Number(latRaw) : NaN
        const longitude = lngRaw !== undefined ? Number(lngRaw) : NaN

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            setDistanceMeters(null)
            return
        }

        if (userLat === null || userLat === undefined || userLng === null || userLng === undefined) {
            setDistanceMeters(null)
            return
        }

        const meters = haversineDistanceMeters(userLat, userLng, latitude, longitude)
        setDistanceMeters(meters)
    }, [activity?.secondary_item?.meta?.latitude, activity?.secondary_item?.meta?.longitude, userLat, userLng])
    
    return (
        <View style={styles.card}>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>{title}</Text>
                        <View style={styles.coordRow}>
                            <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#6b7280" />
                            <Text style={styles.coordText}>{coordinates}</Text>
                        </View>
                    </View>

                    {distanceMeters ?
                        <Text style={styles.timeText}>
                            {((distanceMeters / 1000)).toFixed(2)} km
                        </Text>
                        : null
                    }
                </View>

                {activity.secondary_item.content.rendered ?
                    <Text style={styles.description}>{stripHtml(activity.secondary_item.content.rendered)}</Text>
                    : null
                }

                <View style={styles.photoRow}>
                    {gallery.slice(0, 3).map((item: any, index: number) => (
                        <View key={`${item.id}`} style={styles.photoItemContainer}>
                            <Image
                                source={{ uri: item.thumbnail_url }}
                                style={styles.photoItem}
                            />
                        </View>
                    ))}
                    {extraPhotos > 0 ? (
                        <View style={styles.photoMore}>
                            <Text style={styles.photoMoreText}>{morePhotosLabel}</Text>
                        </View>
                    ) : null}
                </View>
                
                <View style={styles.metaContainer}>
                    <View style={styles.metaRow}>
                        <View style={[styles.metaItem, { alignItems: placeLabel ? 'flex-start' : 'center' }]}>
                            <MaterialCommunityIcons name="map-marker-radius" size={18} color="#10b981" />
                            <Text style={styles.metaText} numberOfLines={2}>{placeLabel ? placeLabel : 'Unknown'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="account-group" size={18} color="#3b82f6" />
                            <Text style={styles.metaText}>{visitorsLabel}</Text>
                        </View>
                    </View>
                    <Pressable style={styles.viewLocationButton} onPress={() => handleOpenDirections(activity)}>
                        <View style={styles.viewLocationContent}>
                            <MaterialCommunityIcons name="map-search" size={14} color="#2563eb" />
                            <Text style={styles.viewLocationText}>{viewPinLabel}</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
            
            <View style={styles.separator} />
            
            <Pressable onPress={() => router.push(`/profile/${activity.user_id}`)}>
                <View style={styles.contributorRow}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https:' + activity.user_avatar.thumb }}
                            style={styles.avatar}
                        />
                    </View>

                    <View style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity.user_profile.name}</Text>
                        <Text style={styles.contributorMeta}>{contributorMeta}</Text>
                    </View>

                    <View style={styles.locationColumn}>
                        <View style={styles.locationRow}>
                            <MaterialCommunityIcons name="map-clock" size={16} color="#000" />
                            <Text style={styles.locationText}>{PinsAddedLabel}</Text>
                        </View>
                        <Text style={styles.postedTime}>{postedTime}</Text>
                    </View>
                </View>
            </Pressable>
        </View>
    )
}

export default SpotHuntPin

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    contentContainer: {
        gap: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        gap: 4,
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
    },
    coordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    coordText: {
        fontSize: 12,
        opacity: 0.8,
        color: '#000',
    },
    timeText: {
        fontSize: 11,
        opacity: 0.6,
        color: '#000',
    },
    description: {
        fontSize: 14,
        color: '#000',
        marginBottom: 0,
        paddingBottom: 0,
    },
    photoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    photoItemContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    photoItem: {
        width: '100%',
        height: '100%',
    },
    photoMore: {
        height: 36,
        width: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    photoMoreText: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
        color: '#000',
    },
    metaRow: {
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        flexDirection: 'column',
        gap: 0,
        flex: 1,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        maxWidth: '85%',
    },
    metaText: {
        fontSize: 12,
        opacity: 0.8,
        color: '#000',
        flex: 1,
    },
    metaContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 10,
    },
    contributorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    contributorInfo: {
        flex: 1,
        gap: 2,
    },
    contributorName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    contributorMeta: {
        fontSize: 12,
        opacity: 0.8,
        color: '#000',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationColumn: {
        alignItems: 'flex-end',
        gap: 2,
    },
    locationText: {
        fontSize: 12,
        opacity: 0.9,
        color: '#000',
    },
    postedTime: {
        fontSize: 11,
        opacity: 0.7,
        color: '#000',
    },
    viewLocationButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewLocationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewLocationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563eb',
    },
})