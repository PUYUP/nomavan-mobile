import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet } from 'react-native';
import { Avatar, Button, Card, Separator, Text, View, XStack, YStack } from 'tamagui';

const ArrivedOnSite = () => {
    return (
        <>
            <Card style={styles.card}>
                <YStack style={styles.arrivedBlock}>
                    <XStack flex={1}>
                        <MaterialCommunityIcons name="map-marker-check" size={28} color="#22c55e" />
                        <YStack flex={1} paddingStart="$2.5">
                            <XStack style={styles.arrivedRow}>
                                <YStack style={styles.arrivedInfo}>
                                    <Text style={styles.arrivedLabel}>Arrived</Text>
                                    <Text style={styles.arrivedTitle}>Twin Creek Trailhead</Text>
                                    <Text style={styles.arrivedMeta}>Coconino NF</Text>
                                </YStack>
                                <Text style={styles.arrivedStatText}>32 minutes ago</Text>
                            </XStack>

                            <XStack style={styles.arrivedStats} marginBlockStart="$2.5">
                                <XStack style={styles.arrivedStatItem}>
                                    <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#6b7280" />
                                    <Text style={styles.arrivedStatText}>2.3 hours</Text>
                                </XStack>
                                <XStack style={styles.arrivedStatItem}>
                                    <MaterialCommunityIcons name="road-variant" size={14} color="#6b7280" />
                                    <Text style={styles.arrivedStatText}>18.6 km</Text>
                                </XStack>
                            </XStack>
                        </YStack>
                    </XStack>

                    <View style={styles.arrivedDivider} />
                    
                    <XStack flex={1}>
                        <MaterialCommunityIcons name="map-marker" size={28} color="#ef4444" />
                        <YStack flex={1} paddingStart="$2.5">
                            <XStack style={styles.arrivedRow}>
                                <YStack style={styles.arrivedInfo}>
                                    <Text style={styles.arrivedLabel}>From</Text>
                                    <Text style={styles.arrivedTitle}>Wawa & Sheetz</Text>
                                    <Text style={styles.arrivedMeta}>Sedona, AZ</Text>
                                </YStack>
                                <Text style={styles.arrivedStatText}>3 days ago</Text>
                            </XStack>
                        </YStack>
                    </XStack>
                </YStack>

                <Separator my={10} />

                <XStack style={styles.contributorRow}>
                    <Avatar circular size="$3" style={styles.avatar}>
                        <Avatar.Image
                            src="https://i.pravatar.cc/100?img=8"
                            accessibilityLabel="Contributor avatar"
                        />
                        <Avatar.Fallback />
                    </Avatar>

                    <YStack style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>Angelina Ho</Text>
                        <Text style={styles.contributorMeta}>10 contribs.</Text>
                    </YStack>

                    <Text style={styles.onWayText}>87 en route</Text>
                    
                    <Button size="$2" style={styles.viewLocationButton}>
                        <XStack style={styles.thanksContent}>
                            <MaterialCommunityIcons name="history" size={16} />
                            <Text style={styles.thanksText}>View Log</Text>
                        </XStack>
                    </Button>
                </XStack>
            </Card>
        </>
    )
}

export default ArrivedOnSite

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    row: {
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
    },
    subtitle: {
        fontSize: 10,
        opacity: 0.8,
        textAlign: 'center',
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
        gap: 4,
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
    onWayText: {
        fontSize: 12,
        opacity: 0.7,
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
    arrivedBlock: {
        gap: 12,
        paddingVertical: 6,
    },
    arrivedRow: {
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
    },
    arrivedTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    arrivedMeta: {
        fontSize: 12,
        opacity: 0.8,
    },
    arrivedDivider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginLeft: 40,
    },
    arrivedStats: {
        flexDirection: 'row',
        gap: 12,
    },
    arrivedStatItem: {
        alignItems: 'center',
        gap: 6,
    },
    arrivedStatText: {
        fontSize: 12,
        opacity: 0.8,
        fontWeight: '600',
    },
})