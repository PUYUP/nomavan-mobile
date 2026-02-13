import { BPActivityResponse } from '@/services/apis/activity-api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { FavoriteButton } from '../favoriting';

const SIGNAL_COLORS = {
    bad: '#ff817b',
    orange: '#f59e0b',
    medium: '#efbb11',
    good: '#58a86a',
    inactive: '#d1d5db',
} as const

type ConnectivityUpdateProps = {
    activity?: BPActivityResponse | null;
};

function signalLevelToDbmRange(level: number): { min: number, max: number } {
    const MIN_DBM = -120;
    const MAX_DBM = -50;
    const LEVELS = 5;
    const clamped = Math.min(Math.max(level, 0), LEVELS - 1);
    const step = (MAX_DBM - MIN_DBM) / LEVELS;
    const min = Math.round(MIN_DBM + step * clamped);
    const max = Math.round(MIN_DBM + step * (clamped + 1));

    return { min: min, max: max };
}

const clampStrength = (value: number) => Math.min(Math.max(value, 0), 4);

const getSignalColor = (strength: number) => {
    switch (strength) {
        case 0:
            return SIGNAL_COLORS.bad;
        case 1:
            return SIGNAL_COLORS.orange;
        case 2:
            return SIGNAL_COLORS.medium;
        case 3:
        case 4:
        default:
            return SIGNAL_COLORS.good;
    }
};

const ConnectivityUpdate = ({ activity = null }: { activity?: BPActivityResponse | null }) => {
    if (!activity) {
        return null;
    }

    const router = useRouter();
    const rawStrength = Number(activity.secondary_item.meta.strength);
    const strengthLevel = Number.isFinite(rawStrength) ? clampStrength(rawStrength) : null;
    const strengthRange = signalLevelToDbmRange(strengthLevel ?? 0);
    const strengthColor = strengthLevel === null ? SIGNAL_COLORS.inactive : getSignalColor(strengthLevel);
    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';

    const handleOpenDirections = (item: BPActivityResponse | null) => {
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

    return (
        <View style={styles.card}>
            <View style={[styles.row, { marginBottom: 16 }]}>
                <MaterialCommunityIcons style={styles.mainIcon} color={strengthColor} name='access-point-network' />
                <View style={styles.strengthCol}>
                    <View style={styles.strengthRow}>
                        <Text style={[styles.title, { color: strengthColor }]}>
                            {strengthRange.min}
                        </Text>
                        <Text style={styles.subtitle}>to</Text>
                        <Text style={[styles.title, { color: strengthColor }]}>
                            {strengthRange.max}
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>dBm</Text>
                </View>

                <View style={styles.carrierContainer}>
                    <Text style={styles.carrierName} numberOfLines={1}>
                        {activity.secondary_item.meta.carrier ? activity.secondary_item.meta.carrier : 'Unknown'}
                    </Text>
                    <Text style={styles.carrierLabel}>Carrier</Text>
                </View>

                <View style={styles.signalGraph}>
                    {[28, 28, 28, 28, 28].map((height, index) => {
                        const isActive = strengthLevel !== null && strengthLevel > 0 && index < strengthLevel;
                        const barColor = isActive ? strengthColor : SIGNAL_COLORS.inactive;

                        return (
                            <View
                                key={`bar-${index}`}
                                style={[styles.signalBar, { height, backgroundColor: barColor }]}
                            />
                        )
                    })}
                </View>
            </View>

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
                        <Text style={styles.contributorMeta}>1.276 contribs.</Text>
                    </View>

                    <View style={styles.locationColumn}>
                        <View style={styles.locationRow}>
                            <MaterialCommunityIcons name="map-marker-radius" size={16} color="#000" />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {activity.secondary_item.meta.place_name}
                            </Text>
                        </View>
                        <Text style={styles.postedTime}>{postedTime}</Text>
                    </View>
                </View>
            </Pressable>

            <View style={styles.separator} />

            <View style={styles.thanksRow}>
                <FavoriteButton activity={activity} />
            </View>
        </View>
    )
}

export default ConnectivityUpdate

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
        gap: 8,
    },
    strengthCol: {
        borderRightColor: '#e5e5e5',
        borderRightWidth: 1,
        paddingRight: 6,
    },
    strengthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mainIcon: {
        fontSize: 32,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        color: '#000',
    },
    subtitle: {
        fontSize: 10,
        opacity: 0.8,
        textAlign: 'center',
        color: '#000',
    },
    carrierContainer: {
        flex: 1,
    },
    carrierName: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000',
        maxWidth: 130,
    },
    carrierLabel: {
        fontSize: 10,
        opacity: 0.8,
        textAlign: 'left',
        color: '#000',
    },
    signalGraph: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        marginLeft: 'auto',
    },
    signalBar: {
        width: 7,
        borderRadius: 4,
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
        width: 120,
        gap: 2,
        paddingRight: 12,
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
    thanksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
})