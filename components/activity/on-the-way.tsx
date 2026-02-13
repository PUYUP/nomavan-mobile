import { BPActivityResponse } from '@/services/activity';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type ComponentProps = {
    activity: BPActivityResponse | null
}

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

const OnTheWay = ({ activity = null }: ComponentProps) => {
    if (!activity) {
        return null;
    }

    const router = useRouter();
    const postedTime = (activity.secondary_item?.meta?.previous_route_point_id ? formatDistanceToNow(new Date(activity.secondary_item.meta?.previous_route_point_id?.date)) : '-').replace('about', '');
    const distance = distanceInMeters(
        { latitude: activity.secondary_item?.meta.latitude, longitude: activity.secondary_item?.meta.longitude },
        { latitude: activity.secondary_item?.meta?.previous_route_point_id?.latitude, longitude: activity.secondary_item?.meta?.previous_route_point_id?.longitude }
    );

    return (
        <View style={styles.card}>
            <View style={styles.directionBlock}>
                <View style={styles.directionRowContainer}>
                    <MaterialCommunityIcons name="map-marker" size={28} color="#ef4444" />
                    <View style={styles.directionContent}>
                        <View style={styles.directionRow}>
                            <View style={styles.directionInfo}>
                                <Text style={styles.directionLabel}>From</Text>
                                <Text style={styles.directionTitle}>
                                    {activity.secondary_item?.meta?.previous_route_point_id?.place_name ?
                                        activity.secondary_item?.meta?.previous_route_point_id?.place_name
                                        : 'Unknown'
                                    }
                                </Text>
                            </View>
                            <Text style={styles.directionDistance}>{postedTime}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.directionDivider} />

                <View style={styles.directionRowContainer}>
                    <MaterialCommunityIcons name="flag" size={28} color="#22c55e" />
                    <View style={styles.directionContent}>
                        <View style={styles.directionRow}>
                            <View style={styles.directionInfo}>
                                <Text style={styles.directionLabel}>To</Text>
                                <Text style={styles.directionTitle}>{activity.secondary_item?.title?.rendered}</Text>
                            </View>
                            <Text style={styles.directionDistance}>
                                {distance || distance == 0 ? Math.round((distance / 1000) * 100) / 100 : '-'} km
                            </Text>
                        </View>
                    </View>
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
                        <Text style={styles.contributorMeta}>713 checkpoints</Text>
                    </View>

                    <Text style={styles.onWayText}>102 en route</Text>
                    
                    <Pressable style={styles.viewLocationButton}>
                        <View style={styles.thanksContent}>
                            <MaterialCommunityIcons name="directions" size={14} color="#3b82f6" />
                            <Text style={styles.thanksText}>Me Too</Text>
                        </View>
                    </Pressable>
                </View>
            </Pressable>
        </View>
    )
}

export default OnTheWay

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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    strengthCol: {
        borderRightColor: '#e5e5e5',
        borderRightWidth: 1,
        paddingRight: 12,
    },
    mainIcon: {
        fontSize: 36,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        fontFamily: 'Inter-Black',
        color: '#000',
    },
    subtitle: {
        fontSize: 10,
        opacity: 0.8,
        textAlign: 'center',
        color: '#000',
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
    thanksButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
    },
    thanksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    thanksLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    thanksContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    thanksText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
    },
    onWayText: {
        fontSize: 12,
        opacity: 0.7,
        color: '#000',
    },
    thanksCount: {
        alignItems: 'center',
    },
    thanksCountText: {
        fontSize: 12,
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
    directionBlock: {
        gap: 12,
        paddingVertical: 6,
    },
    directionRowContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    directionContent: {
        flex: 1,
        paddingLeft: 10,
    },
    directionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    directionInfo: {
        flex: 1,
        gap: 2,
    },
    directionLabel: {
        fontSize: 11,
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#000',
    },
    directionTitle: {
        fontSize: 14,
        color: '#000',
    },
    directionMeta: {
        fontSize: 12,
        opacity: 0.8,
        color: '#000',
    },
    directionDistance: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
        color: '#000',
    },
    directionDivider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginLeft: 40,
    },
})