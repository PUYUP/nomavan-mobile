import { BPActivityResponse } from '@/services/activity';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Linking, Platform, Pressable, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Separator, Text, View, XStack, YStack } from 'tamagui';

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

const ConnectivityUpdate = ({ activity = null }: ConnectivityUpdateProps) => {
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
        <>
            <Card style={styles.card}>
                <XStack gap="$2" style={styles.row}>
                    <MaterialCommunityIcons style={styles.mainIcon} color={strengthColor} name='access-point-network' />
                    <YStack style={styles.strengthCol}>
                        <XStack items={'center'} gap={'$2'}>
                            <Text style={[styles.title, { color: strengthColor }]}>
                                {strengthRange.min}
                            </Text>
                            <Text style={styles.subtitle}>to</Text>
                            <Text style={[styles.title, { color: strengthColor }]}>
                                {strengthRange.max}
                            </Text>
                        </XStack>
                        <Text style={styles.subtitle}>dBm</Text>
                    </YStack>

                    <YStack>
                        <Text style={[styles.title, { fontWeight: 'normal' }]} numberOfLines={1} maxW={130}>{activity.secondary_item.meta.carrier} hari merdeka raya</Text>
                        <Text style={[styles.subtitle, { textAlign: 'left'}]}>Carrier</Text>
                    </YStack>

                    <View style={styles.signalGraph}>
                        {[28, 28, 28, 28, 28].map((height, index) => {
                            const isActive = strengthLevel !== null && strengthLevel > 0 && index < strengthLevel;
                            const barColor = isActive ? strengthColor : SIGNAL_COLORS.inactive;

                            return (
                                <View
                                    key={`bar-${index}`}
                                    height={height}
                                    style={[styles.signalBar, { backgroundColor: barColor }]}
                                />
                            )
                        })}
                    </View>
                </XStack>

                <Separator my={10} />
                
                <Pressable onPress={() => router.push(`/profile/${activity.user_id}`)}>
                    <XStack style={styles.contributorRow}>
                        <Avatar circular size="$4" style={styles.avatar}>
                            <Avatar.Image
                                src={'https:' + activity.user_avatar.thumb}
                                accessibilityLabel="Contributor avatar"
                            />
                            <Avatar.Fallback />
                        </Avatar>

                        <YStack style={styles.contributorInfo}>
                            <Text style={styles.contributorName}>{activity.user_profile.name}</Text>
                            <Text style={styles.contributorMeta}>1.276 contribs.</Text>
                        </YStack>

                        <YStack style={styles.locationColumn}>
                            <XStack style={styles.locationRow}>
                                <MaterialCommunityIcons name="map-marker-radius" size={16} />
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {activity.secondary_item.meta.place_name}
                                </Text>
                            </XStack>
                            <Text style={styles.postedTime}>{postedTime}</Text>
                        </YStack>
                    </XStack>
                </Pressable>

                <Separator my={10} />

                <XStack style={styles.thanksRow}>
                    <XStack style={styles.thanksLeft}>
                        <Button size="$2" style={styles.thanksButton}>
                            <XStack style={styles.thanksContent}>
                                <MaterialCommunityIcons name="thumb-up" size={14} />
                                <Text style={styles.thanksText}>Say Thanks</Text>
                            </XStack>
                        </Button>

                        <View style={styles.thanksCount}>
                            <Text style={styles.thanksCountText}>130 thanks</Text>
                        </View>
                    </XStack>

                    <Button size="$2" style={styles.viewLocationButton} onPress={() => handleOpenDirections(activity)}>
                        <XStack style={styles.thanksContent}>
                            <MaterialCommunityIcons name="map" size={14} />
                            <Text style={styles.thanksText}>Location</Text>
                        </XStack>
                    </Button>
                </XStack>
            </Card>
        </>
    )
}

export default ConnectivityUpdate

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    row: {
        alignItems: 'center',
    },
    strengthCol: {
        borderRightColor: '#e5e5e5',
        borderRightWidth: 1,
        paddingRight: 6,
    },
    mainIcon: {
        fontSize: 32,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 10,
        opacity: 0.8,
        textAlign: 'center',
    },
    badSignalColor: {
        color: SIGNAL_COLORS.bad,
    },
    mediumSignalColor: {
        color: SIGNAL_COLORS.medium,
    },
    goodSignalColor: {
        color: SIGNAL_COLORS.good,
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
    signalBarBad: {
        backgroundColor: SIGNAL_COLORS.bad,
    },
    signalBarMedium: {
        backgroundColor: SIGNAL_COLORS.medium,
    },
    signalBarGood: {
        backgroundColor: SIGNAL_COLORS.good,
    },
    signalBarInactive: {
        backgroundColor: SIGNAL_COLORS.inactive,
    },
    contributorRow: {
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    contributorInfo: {
        flex: 1,
        gap: 2,
    },
    contributorName: {
        fontSize: 14,
        fontWeight: '700',
    },
    contributorMeta: {
        fontSize: 12,
        opacity: 0.8,
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
    },
    postedTime: {
        fontSize: 11,
        opacity: 0.7,
    },
    thanksButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
    },
    thanksRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    thanksLeft: {
        alignItems: 'center',
        gap: 8,
    },
    thanksContent: {
        alignItems: 'center',
        gap: 6,
    },
    thanksText: {
        fontSize: 12,
        fontWeight: '600',
    },
    thanksCount: {
        alignItems: 'center',
    },
    thanksCountText: {
        fontSize: 12,
        opacity: 0.7,
    },
    viewLocationButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#eef2ff',
    },
})