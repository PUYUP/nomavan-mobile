import { BPActivityResponse } from '@/services/activity'
import { getAuth } from '@/services/auth-storage'
import { JoinPayload, LeavePayload, MembershipPayload, useJoinMeetupMutation, useLeaveMeetupMutation, useRequestMembershipMutation } from '@/services/meetup'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Card } from '@tamagui/card'
import { format, formatDistanceToNow, isSameDay, isValid } from 'date-fns'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Linking, Platform, Pressable, StyleSheet } from 'react-native'
import Toast from 'react-native-toast-message'
import { Avatar, Button, Paragraph, Separator, Text, XStack, YStack } from 'tamagui'

type MeetupProps = {
    activity: BPActivityResponse | null
    userLat?: number | null
    userLng?: number | null
}

const Meetup = ({
    activity = null,
    userLat = null,
    userLng = null,
}: MeetupProps) => {
    if (!activity) {
        return null
    }

    const router = useRouter();
    const directionsColor = '#029baf'
    const [distanceMeters, setDistanceMeters] = useState<number | null>(null)
    const descriptionText = activity?.primary_item?.description?.rendered
        ? stripHtml(activity?.primary_item?.description?.rendered)
        : activity?.primary_item?.description?.raw ?? '';

    const startAtRaw = activity?.primary_item?.start_at ?? '';
    const endAtRaw = activity?.primary_item?.end_at ?? '';
    const startAt = startAtRaw ? new Date(startAtRaw) : null;
    const endAt = endAtRaw ? new Date(endAtRaw) : null;

    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';
    const dateRangeText = startAt && endAt && isValid(startAt) && isValid(endAt)
        ? isSameDay(startAt, endAt)
            ? `${format(startAt, 'MMM dd, yyyy')} • ${format(startAt, 'hh:mm a')} - ${format(endAt, 'hh:mm a')}`
            : `${format(startAt, 'MMM dd, yyyy')} • ${format(startAt, 'hh:mm a')} - ${format(endAt, 'MMM dd, yyyy')} • ${format(endAt, 'hh:mm a')}`
        : 'Anytime';

    const [joinMeetup, { isLoading: isJoining }] = useJoinMeetupMutation({ fixedCacheKey: 'join-meetup-process' });
    const [leaveMeetup, { isLoading: isLeaving }] = useLeaveMeetupMutation({ fixedCacheKey: 'leave-meetup-process' });
    const [requestMembership, { isLoading: isRequesting }] = useRequestMembershipMutation();

    useEffect(() => {
        const latRaw = activity?.primary_item?.latitude
        const lngRaw = activity?.primary_item?.longitude
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
    }, [activity?.primary_item?.latitude, activity?.primary_item?.longitude, userLat, userLng])

    const handleOpenDirections = (item: BPActivityResponse | null) => {
        if (1 > 0) {
            router.push({
                pathname: '/feeds/meetup',
                params: {
                    id: item?.id,
                }
            });
            return;
        }

        const latitude = item?.primary_item?.latitude?.trim()
        const longitude = item?.primary_item?.longitude?.trim()

        if (!latitude || !longitude) return

        const query = encodeURIComponent(`${latitude},${longitude}`)
        const label = encodeURIComponent(item?.primary_item?.place_name)
        const url = Platform.OS === 'ios'
            ? `http://maps.apple.com/?ll=${query}&q=${label}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`

        Linking.openURL(url)
    }

    /**
     * Join meetup
     */
    const handleJoinMeetup = async (meetup: any) => {
        const auth = await getAuth();
        
        // check is member or not
        if (meetup?.member_detail?.is_member) {
            const leavePayload: LeavePayload = {
                group_id: meetup.id,
                user_id: parseInt(auth?.user?.id as string),
                context: 'edit',
            }

            const result = await leaveMeetup(leavePayload);
            if (result && result.data) {
                Toast.show({
                    type: 'info',
                    text1: 'You’ve left the group',
                    text2: 'You can rejoin anytime if you change your mind.',
                    visibilityTime: 1500,
                });
            }
            return;
        }

        // Join or request membership (for private meetup)
        let result = null;
        
        if (meetup.status === 'public') {
            const payload: JoinPayload = {
                group_id: meetup.id,
                context: 'edit',
            }
            result = await joinMeetup(payload);
            
        } else if (meetup.status === 'private') {
            const payload: MembershipPayload = {
                group_id: meetup.id,
                message: '',
            }

            result = await requestMembership(payload);
        }

        if (result && result.data) {
            Toast.show({
                type: 'success',
                text1: 'You’ve joined the group!',
                text2: 'Start connecting and explore activities with members.',
                visibilityTime: 1500,
            });
        }
    }

    return (
        <Card style={styles.card}>
            <YStack gap="$3">
                <YStack gap="$2">
                    <XStack style={{ alignItems: 'start', justifyContent: 'space-between' }}>
                        <Text fontSize={16} fontWeight="700" maxW={'80%'}>{activity?.primary_item?.name}</Text>
                        {activity?.primary_item?.member_detail?.is_creator 
                            ?   <Button size="$2" onPress={async () => {}}>
                                    <XStack gap="$2">
                                        <MaterialCommunityIcons 
                                            name="file-document-edit-outline" 
                                            size={14} 
                                        />
                                        <Text fontSize={12} fontWeight="600">Edit</Text>
                                    </XStack>
                                </Button>
                            :   <Button size="$2" onPress={async () => await handleJoinMeetup(activity?.primary_item)}>
                                    <XStack gap="$2">
                                        <MaterialCommunityIcons 
                                            name={activity?.primary_item?.member_detail?.is_member ? 'account-minus' : 'account-plus'} 
                                            size={14} 
                                        />
                                        <Text fontSize={12} fontWeight="600">
                                            {activity?.primary_item?.member_detail?.is_member ? 'Leave' : 'Join'}
                                        </Text>
                                    </XStack>
                                </Button>
                        }
                    </XStack>
                    <XStack gap="$2" marginBlockStart="$2">
                        <MaterialCommunityIcons name="calendar-range" size={16} color="#ff817b" />
                        <Text fontSize={12} opacity={0.8}>{dateRangeText}</Text>
                    </XStack>
                    <XStack gap="$2" style={{ marginTop: -2 }}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#ff817b" />
                        <Text fontSize={12} opacity={0.8} marginEnd={22}>
                            {activity?.primary_item?.place_name ? activity?.primary_item?.place_name : '-'}
                        </Text>
                    </XStack>
                    <XStack gap="$2" style={{ marginTop: -2 }}>
                        <MaterialCommunityIcons name="account-multiple-outline" size={16} color="#ff817b" />
                        <Text fontSize={12} opacity={0.8}>
                            {activity?.primary_item?.capacity ? activity?.primary_item?.capacity + ' spots left' : 'Unlimited'}
                        </Text>
                    </XStack>
                    <Paragraph fontSize={14} opacity={0.8} lineHeight={'$3'}>{descriptionText}</Paragraph>
                </YStack>

                <XStack style={{ justifyContent: 'space-between' }}>
                    <XStack gap="$2" style={{ alignItems: 'center' }}>
                        <XStack gap="$2">
                            {activity?.primary_item?.member_detail?.users?.map((user: any, index: number) => (
                                <Avatar key={user.id} circular size="$2" style={{ marginLeft: index === 0 ? 0 : -4 }}>
                                    <Avatar.Image src={'https:' + user.user_avatar.thumb} accessibilityLabel={user.name} />
                                    <Avatar.Fallback />
                                </Avatar>
                            ))}
                        </XStack>
                        <Text fontSize={12} opacity={0.7}>{'+' + activity?.primary_item?.member_detail?.count}</Text>
                    </XStack>

                    <XStack gap="$2">
                        <Button size="$2" onPress={() => handleOpenDirections(activity)}>
                            <XStack gap="$2" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="directions" size={24} color={directionsColor} />
                                <YStack>
                                    <Text fontSize={12} fontWeight="600" color={directionsColor}>
                                        Directions
                                    </Text>
                                    
                                    {distanceMeters ?
                                        <Text fontSize={10} fontWeight={700} opacity={0.8} color={'#333'}>
                                            {((distanceMeters / 1000)).toFixed(2)} km
                                        </Text>
                                        : null
                                    }
                                </YStack>
                            </XStack>
                        </Button>
                    </XStack>
                </XStack>
            </YStack>

            <Separator my={10} />
            
            <Pressable onPress={() => router.push(`/profile/${activity.user_id}`)}>
                <XStack style={styles.contributorRow}>
                    <Avatar circular size="$4" style={styles.avatar}>
                        <Avatar.Image
                            src={'https:' + activity?.user_avatar?.thumb}
                            accessibilityLabel="Contributor avatar"
                        />
                        <Avatar.Fallback />
                    </Avatar>

                    <YStack style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity?.user_profile?.name}</Text>
                        <Text style={styles.contributorMeta}>10 contribs.</Text>
                    </YStack>

                    <Text style={styles.onWayText}>{postedTime}</Text>
                </XStack>
            </Pressable>
        </Card>
    )
}

export default Meetup

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
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
    thanksText: {
        fontSize: 12,
        fontWeight: '600',
    },
})

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
