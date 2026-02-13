import { BPActivityResponse } from '@/services/activity';
import { presentPaywall } from '@/utils/paywall';
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

const ArrivedOnSite = ({ activity = null }: ComponentProps) => {
    if (!activity) {
        return null;
    }
    
    const router = useRouter();
    const postedTime = (activity.secondary_item?.meta?.previous_route_point_id ? formatDistanceToNow(new Date(activity?.secondary_item.meta?.previous_route_point_id?.date)) : '-').replace('about', '');
    
    const handleUnlock = async () => {
        // router.push({
        //     pathname: '/insights/journey-stats',
        //     params: { activityId: activity.id.toString() },
        // });
        // return;

        const success = await presentPaywall();
        if (success) {
            // User purchased or restored
            // You can add logic here to refresh data or unlock features
            router.push({
                pathname: '/insights/journey-stats',
                params: { activityId: activity.id.toString() },
            });
        }
    };
    
    const distance = distanceInMeters(
        { latitude: activity.secondary_item?.meta.latitude, longitude: activity.secondary_item?.meta.longitude },
        { latitude: activity.secondary_item?.meta?.previous_route_point_id?.latitude, longitude: activity.secondary_item?.meta?.previous_route_point_id?.longitude }
    );

    return (
        <View style={styles.card}>
            <View style={styles.arrivedBlock}>
                <View style={styles.arrivedRowContainer}>
                    <MaterialCommunityIcons name="map-marker-check" size={28} color="#22c55e" />
                    <View style={styles.arrivedContent}>
                        <View style={styles.arrivedRow}>
                            <View style={styles.arrivedInfo}>
                                <Text style={styles.arrivedLabel}>Arrived</Text>
                                <Text style={styles.arrivedTitle}>
                                    {activity.secondary_item.title.rendered}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.arrivedStats}>
                            <View style={styles.arrivedStatItem}>
                                <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#6b7280" />
                                <Text style={styles.arrivedStatText}>{Math.round((activity.secondary_item?.meta?.time_from_prev / 60) * 100) / 100} hours</Text>
                            </View>
                            <View style={styles.arrivedStatItem}>
                                <MaterialCommunityIcons name="road-variant" size={14} color="#6b7280" />
                                <Text style={styles.arrivedStatText}>
                                    {distance || distance == 0 ? Math.round((distance / 1000) * 100) / 100 : '-'} km
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.arrivedDivider} />
                
                <View style={styles.arrivedRowContainer}>
                    <MaterialCommunityIcons name="map-marker" size={28} color="#ef4444" />
                    <View style={styles.arrivedContent}>
                        <View style={styles.arrivedRow}>
                            <View style={styles.arrivedInfo}>
                                <Text style={styles.arrivedLabel}>From</Text>
                                <Text style={styles.arrivedTitle}>
                                    {activity.secondary_item?.meta?.previous_route_point_id?.place_name ?
                                        activity.secondary_item?.meta?.previous_route_point_id?.place_name
                                        : 'Unknown'
                                    }
                                </Text>
                            </View>
                            <Text style={styles.arrivedStatText}>{postedTime}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.statsContainer}>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="map-marker-account" size={20} color="#22c55e" />
                        <Text style={styles.statValue}>24</Text>
                        <Text style={styles.statLabel}>Route Points</Text>
                    </View>
                    
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="cash-multiple" size={20} color="#f59e0b" />
                        <Text style={styles.statValue}>$2,450</Text>
                        <Text style={styles.statLabel}>Expenses</Text>
                    </View>
                    
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="cart" size={20} color="#8b5cf6" />
                        <Text style={styles.statValue}>156</Text>
                        <Text style={styles.statLabel}>Items</Text>
                    </View>
                    
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#3b82f6" />
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Stories</Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#ec4899" />
                        <Text style={styles.statValue}>8</Text>
                        <Text style={styles.statLabel}>Spot Hunts</Text>
                    </View>
                    
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="account-group" size={20} color="#14b8a6" />
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Meetups</Text>
                    </View>
                    
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="wifi" size={20} color="#06b6d4" />
                        <Text style={styles.statValue}>18</Text>
                        <Text style={styles.statLabel}>Connectivity</Text>
                    </View>
                    
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="camera" size={20} color="#f97316" />
                        <Text style={styles.statValue}>47</Text>
                        <Text style={styles.statLabel}>Photos</Text>
                    </View>
                </View>

                <Pressable style={styles.unlockButton} onPress={handleUnlock}>
                    <MaterialCommunityIcons name="lock-open-variant" size={18} color="#fff" />
                    <Text style={styles.unlockButtonText}>Unlock Full Journey Stats</Text>
                </Pressable>
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

                    <Text style={styles.onWayText}>87 en route</Text>
                    
                    <Pressable style={styles.viewLocationButton}>
                        <View style={styles.thanksContent}>
                            <MaterialCommunityIcons name="map-marker-path" size={16} color="#3b82f6" />
                            <Text style={styles.thanksText}>Route</Text>
                        </View>
                    </Pressable>
                </View>
            </Pressable>
        </View>
    )
}

export default ArrivedOnSite

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
    arrivedBlock: {
        gap: 12,
        paddingVertical: 6,
    },
    arrivedRowContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    arrivedContent: {
        flex: 1,
        paddingLeft: 10,
    },
    arrivedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    arrivedInfo: {
        flex: 1,
        gap: 2,
    },
    arrivedLabel: {
        fontSize: 11,
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#000',
    },
    arrivedTitle: {
        fontSize: 14,
        color: '#000',
    },
    arrivedMeta: {
        fontSize: 12,
        opacity: 0.8,
        color: '#000',
    },
    arrivedDivider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginLeft: 40,
    },
    arrivedStats: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    arrivedStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    arrivedStatText: {
        fontSize: 12,
        opacity: 0.8,
        fontWeight: '600',
        color: '#000',
    },
    statsContainer: {
        gap: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 10,
        opacity: 0.7,
        color: '#000',
        textAlign: 'center',
    },
    unlockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#059669',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 4,
    },
    unlockButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
})