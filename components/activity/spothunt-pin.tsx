import { BPActivityResponse } from '@/services/activity';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Card } from "@tamagui/card";
import { Separator } from "@tamagui/separator";
import { XStack, YStack } from "@tamagui/stacks";
import { formatDistanceToNow } from 'date-fns';
import { Linking, Platform, StyleSheet } from "react-native";
import { Avatar, Button, Paragraph, Text } from "tamagui";

type SpotHuntPinProps = {
    activity?: BPActivityResponse | null
    title?: string
    photos?: string[]
    morePhotosLabel?: string
    visitorsLabel?: string
    viewPinLabel?: string
    contributorMeta?: string
    PinsAddedLabel?: string
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const SpotHuntPin = ({
    activity = null,
    photos = [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=80',
    ],
    morePhotosLabel = '+7',
    visitorsLabel = '10 were here',
    viewPinLabel = 'Find Spot',
    contributorMeta = '1.276 contribs.',
    PinsAddedLabel = '36 Pin Added',
}: SpotHuntPinProps) => {
    if (!activity) {
        return null;
    }

    const coordinates = activity.secondary_item.meta.latitude + ', ' + activity.secondary_item.meta.longitude;
    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';
    const placeLabel = activity.secondary_item.meta.address ? activity.secondary_item.meta.address : null;
    const title = activity.secondary_item.title.rendered ? stripHtml(activity.secondary_item.title.rendered) : 'New Pin Dropped';
    
    const handleOpenDirections = (item: BPActivityResponse | null) => {
        const latitude = item?.secondary_item?.meta?.latitude;
        const longitude = item?.secondary_item?.meta?.longitude;

        if (!latitude || !longitude) return

        const query = encodeURIComponent(`${latitude},${longitude}`)
        const label = encodeURIComponent(item?.secondary_item?.meta?.address)
        const url = Platform.OS === 'ios'
            ? `http://maps.apple.com/?ll=${query}&q=${label}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`

        Linking.openURL(url)
    }
    
    return (
        <Card style={styles.card}>
            <YStack gap={10}>
                <XStack style={styles.headerRow}>
                    <YStack gap={4}>
                        <Text style={styles.title}>{title}</Text>
                        <XStack style={styles.coordRow}>
                            <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#6b7280" />
                            <Text style={styles.coordText}>{coordinates}</Text>
                        </XStack>
                    </YStack>
                    <Text style={styles.timeText}>14.5 km</Text>
                </XStack>

                {activity.secondary_item.content.rendered ?
                    <Paragraph style={{ marginBottom: 0, paddingBottom: 0 }} marginBlockEnd={0}>{stripHtml(activity.secondary_item.content.rendered)}</Paragraph>
                    : null
                }

                <XStack style={styles.photoRow}>
                    {photos.slice(0, 3).map((photoUrl, index) => (
                        <Avatar key={`${photoUrl}-${index}`} circular size="$4" style={styles.photoItem}>
                            <Avatar.Image
                                src={photoUrl}
                                accessibilityLabel="Pin photo"
                            />
                            <Avatar.Fallback />
                        </Avatar>
                    ))}
                    <YStack style={styles.photoMore}>
                        <Text style={styles.photoMoreText}>{morePhotosLabel}</Text>
                    </YStack>
                </XStack>
                
                <XStack style={styles.metaContainer}>
                    <XStack style={styles.metaRow} flex={1}>
                        <XStack style={[styles.metaItem, { alignItems: placeLabel ? 'start' : 'center' }]}>
                            <MaterialCommunityIcons name="map-marker-radius" size={18} color="#10b981" />
                            <Text style={[styles.metaText]} numberOfLines={2} maxW={'85%'}>{placeLabel ? placeLabel : 'Unknown'}</Text>
                        </XStack>
                        <XStack style={styles.metaItem}>
                            <MaterialCommunityIcons name="account-group" size={18} color="#3b82f6" />
                            <Text style={styles.metaText}>{visitorsLabel}</Text>
                        </XStack>
                    </XStack>
                    <Button size="$2" style={styles.viewLocationButton} onPress={() => handleOpenDirections(activity)}>
                        <XStack style={{ alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name="map-search" size={14} color="#2563eb" />
                            <Text style={styles.viewLocationText}>{viewPinLabel}</Text>
                        </XStack>
                    </Button>
                </XStack>
            </YStack>
            
            <Separator my={10} />

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
                    <Text style={styles.contributorMeta}>{contributorMeta}</Text>
                </YStack>

                <YStack style={styles.locationColumn}>
                    <XStack style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker-radius" size={16} />
                        <Text style={styles.locationText}>{PinsAddedLabel}</Text>
                    </XStack>
                    <Text style={styles.postedTime}>{postedTime}</Text>
                </YStack>
            </XStack>
        </Card>
    )
}

export default SpotHuntPin

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    headerRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
    },
    coordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    coordText: {
        fontSize: 12,
        opacity: 0.8,
    },
    timeText: {
        fontSize: 11,
        opacity: 0.6,
    },
    photoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    photoItem: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
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
    },
    metaRow: {
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        flexDirection: 'column',
        gap: 0,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    metaText: {
        fontSize: 12,
        opacity: 0.8,
    },
    metaContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between'
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
    viewLocationButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#eef2ff',
    },
    viewLocationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563eb',
    },
})