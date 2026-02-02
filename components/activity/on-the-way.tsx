import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet } from 'react-native';
import { Avatar, Button, Card, Separator, Text, View, XStack, YStack } from 'tamagui';

const OnTheWay = () => {
    return (
        <>
            <Card style={styles.card}>
                <YStack style={styles.directionBlock}>
                    <XStack style={styles.directionRow}>
                        <MaterialCommunityIcons name="map-marker" size={18} color="#ef4444" />
                        <YStack style={styles.directionInfo}>
                            <Text style={styles.directionLabel}>From</Text>
                            <Text style={styles.directionTitle}>Wawa & Sheetz</Text>
                            <Text style={styles.directionMeta}>Sedona, AZ</Text>
                        </YStack>
                        <Text style={styles.directionDistance}>1 day ago</Text>
                    </XStack>

                    <View style={styles.directionDivider} />

                    <XStack style={styles.directionRow}>
                        <MaterialCommunityIcons name="flag-checkered" size={18} color="#22c55e" />
                        <YStack style={styles.directionInfo}>
                            <Text style={styles.directionLabel}>To</Text>
                            <Text style={styles.directionTitle}>Twin Creek Trailhead</Text>
                            <Text style={styles.directionMeta}>Coconino NF</Text>
                        </YStack>
                        <Text style={styles.directionDistance}>6.4 mi</Text>
                    </XStack>
                </YStack>

                <Separator my={10} />

                <XStack style={styles.contributorRow}>
                    <Avatar circular size="$3" style={styles.avatar}>
                        <Avatar.Image
                            src="https://i.pravatar.cc/100?img=13"
                            accessibilityLabel="Contributor avatar"
                        />
                        <Avatar.Fallback />
                    </Avatar>

                    <YStack style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>John George</Text>
                        <Text style={styles.contributorMeta}>1.276 contribs.</Text>
                    </YStack>

                    <Text style={styles.onWayText}>102 en route</Text>
                    
                    <Button size="$2" style={styles.viewLocationButton}>
                        <XStack style={styles.thanksContent}>
                            <MaterialCommunityIcons name="directions" size={14} />
                            <Text style={styles.thanksText}>Me Too</Text>
                        </XStack>
                    </Button>
                </XStack>
            </Card>
        </>
    )
}

export default OnTheWay

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
    directionBlock: {
        gap: 12,
        paddingVertical: 6,
    },
    directionRow: {
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
    },
    directionTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    directionMeta: {
        fontSize: 12,
        opacity: 0.8,
    },
    directionDistance: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
    },
    directionDivider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginLeft: 28,
    },
})