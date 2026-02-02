import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Card } from '@tamagui/card'
import { Linking, Platform, StyleSheet } from 'react-native'
import { Avatar, Button, Separator, Text, XStack, YStack, useTheme } from 'tamagui'

type EventProps = {
    name: string
    dateRange: string
    locationName: string
    locationCoords: string
    distance: number
    description: string
    joiners: string[]
    extraJoinLabel: string
    joinButtonLabel: string
}

const Event = ({
    name = 'Sedona Vanlife Meetup',
    dateRange = 'Feb 10, 2026 • 08:00 AM - 12:00 PM',
    locationName = 'Crescent Moon Ranch',
    locationCoords = '34.8697, -111.7610',
    distance = 1300,
    description = 'Morning coffee, trail stories, and van tours by the creek.',
    joiners = [
        'https://i.pravatar.cc/100?img=21',
        'https://i.pravatar.cc/100?img=22',
        'https://i.pravatar.cc/100?img=23',
        'https://i.pravatar.cc/100?img=24',
        'https://i.pravatar.cc/100?img=25',
    ],
    extraJoinLabel = '+10',
    joinButtonLabel = 'Join',
}: EventProps) => {
    const theme = useTheme()
    const directionsColor = '#00bcd4'

    const handleOpenDirections = () => {
        const [rawLat, rawLng] = locationCoords.split(',')
        const latitude = rawLat?.trim()
        const longitude = rawLng?.trim()

        if (!latitude || !longitude) return

        const query = encodeURIComponent(`${latitude},${longitude}`)
        const label = encodeURIComponent(locationName)
        const url = Platform.OS === 'ios'
            ? `http://maps.apple.com/?ll=${query}&q=${label}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`

        Linking.openURL(url)
    }

    return (
        <>
            <Card style={styles.card}>
                <YStack gap="$3">
                    <YStack gap="$2">
                        <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text fontSize={16} fontWeight="700">{name}</Text>
                            <Button size="$2">
                                <XStack gap="$2">
                                    <MaterialCommunityIcons name="account-plus" size={14} />
                                    <Text fontSize={12} fontWeight="600">{joinButtonLabel}</Text>
                                </XStack>
                            </Button>
                        </XStack>
                        <XStack gap="$2" marginTop="$2">
                            <MaterialCommunityIcons name="calendar-range" size={16} color="#ff817b" />
                            <Text fontSize={12} opacity={0.8}>
                                {dateRange}
                            </Text>
                        </XStack>
                        <XStack gap="$2">
                            <MaterialCommunityIcons name="map-marker" size={16} color="#ff817b" />
                            <Text fontSize={12} opacity={0.8}>
                                {locationName}
                            </Text>
                        </XStack>
                        <Text fontSize={12} opacity={0.75}>
                            {description}
                        </Text>
                    </YStack>

                    <XStack style={{ justifyContent: 'space-between' }}>
                        <XStack gap="$2" style={{ alignItems: 'center' }}>
                            <XStack gap="$2">
                                {joiners.map((src, index) => (
                                    <Avatar key={src} circular size="$2" style={{ marginLeft: index === 0 ? 0 : -6 }}>
                                        <Avatar.Image src={src} accessibilityLabel="Joiner avatar" />
                                        <Avatar.Fallback />
                                    </Avatar>
                                ))}
                            </XStack>
                            <Text fontSize={12} opacity={0.7}>{extraJoinLabel}</Text>
                        </XStack>

                        <XStack gap="$2">
                            <Button size="$2" backgroundColor="transparent" onPress={handleOpenDirections}>
                                <XStack gap="$2" style={{ alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="directions" size={24} color={directionsColor} />
                                    <YStack>
                                        <Text fontSize={12} fontWeight="600" color={directionsColor}>
                                            Directions
                                        </Text>
                                        
                                        <Text fontSize={10} fontWeight={700} opacity={0.8} color={'#333'}>
                                            {distance / 1000} km
                                        </Text>
                                    </YStack>
                                </XStack>
                            </Button>
                        </XStack>
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

                    <Text style={styles.onWayText}>72 events</Text>
                    
                    <Button size="$2" style={styles.viewLocationButton}>
                        <XStack style={{ alignItems: 'center', gap: 3 }}>
                            <MaterialCommunityIcons name="calendar-arrow-right" size={16} />
                            <Text style={styles.thanksText}>View</Text>
                        </XStack>
                    </Button>
                </XStack>
            </Card>
        </>
    )
}

export default Event

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
    onWayText: {
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