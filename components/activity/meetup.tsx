import { BPActivityResponse } from '@/services/activity'
import { getAuth } from '@/services/auth-storage'
import { JoinPayload, LeavePayload, MembershipPayload, useJoinMeetupMutation, useLeaveMeetupMutation, useRequestMembershipMutation } from '@/services/meetup'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { format, formatDistanceToNow, isSameDay, isValid } from 'date-fns'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

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
        <View style={styles.card}>
            <View style={styles.contentContainer}>
                <View style={styles.detailsContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.meetupTitle}>{activity?.primary_item?.name}</Text>
                        {activity?.primary_item?.member_detail?.is_creator 
                            ?   <Pressable style={styles.actionButton} onPress={async () => {}}>
                                    <View style={styles.buttonContent}>
                                        <MaterialCommunityIcons 
                                            name="file-document-edit-outline" 
                                            size={14}
                                            color="#000"
                                        />
                                        <Text style={styles.buttonText}>Edit</Text>
                                    </View>
                                </Pressable>
                            :   <Pressable style={styles.actionButton} onPress={async () => await handleJoinMeetup(activity?.primary_item)}>
                                    <View style={styles.buttonContent}>
                                        <MaterialCommunityIcons 
                                            name={activity?.primary_item?.member_detail?.is_member ? 'account-minus' : 'account-plus'} 
                                            size={14}
                                            color="#000"
                                        />
                                        <Text style={styles.buttonText}>
                                            {activity?.primary_item?.member_detail?.is_member ? 'Leave' : 'Join'}
                                        </Text>
                                    </View>
                                </Pressable>
                        }
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="calendar-range" size={16} color="#ff817b" />
                        <Text style={styles.infoText}>{dateRangeText}</Text>
                    </View>
                    <View style={styles.infoRowCompact}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#ff817b" />
                        <Text style={styles.infoTextWithMargin}>
                            {activity?.primary_item?.place_name ? activity?.primary_item?.place_name : '-'}
                        </Text>
                    </View>
                    <View style={styles.infoRowCompact}>
                        <MaterialCommunityIcons name="account-multiple-outline" size={16} color="#ff817b" />
                        <Text style={styles.infoText}>
                            {activity?.primary_item?.capacity ? activity?.primary_item?.capacity + ' spots left' : 'Unlimited'}
                        </Text>
                    </View>
                    <Text style={styles.descriptionText}>{descriptionText}</Text>
                </View>

                <View style={styles.actionsRow}>
                    <View style={styles.membersRow}>
                        <View style={styles.avatarsRow}>
                            {activity?.primary_item?.member_detail?.users?.map((user: any, index: number) => (
                                <View key={user.id} style={[styles.memberAvatarContainer, { marginLeft: index === 0 ? 0 : -4 }]}>
                                    <Image 
                                        source={{ uri: 'https:' + user.user_avatar.thumb }} 
                                        style={styles.memberAvatar}
                                    />
                                </View>
                            ))}
                        </View>
                        <Text style={styles.memberCountText}>{'+' + activity?.primary_item?.member_detail?.count}</Text>
                    </View>

                    <View style={styles.directionsContainer}>
                        <Pressable style={styles.directionsButton} onPress={() => handleOpenDirections(activity)}>
                            <View style={styles.directionsContent}>
                                <MaterialCommunityIcons name="directions" size={24} color={directionsColor} />
                                <View style={styles.directionsTextContainer}>
                                    <Text style={styles.directionsText}>
                                        Directions
                                    </Text>
                                    
                                    {distanceMeters ?
                                        <Text style={styles.distanceText}>
                                            {((distanceMeters / 1000)).toFixed(2)} km
                                        </Text>
                                        : null
                                    }
                                </View>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </View>

            <View style={styles.separator} />
            
            <Pressable onPress={() => router.push(`/profile/${activity.user_id}`)}>
                <View style={styles.contributorRow}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https:' + activity?.user_avatar?.thumb }}
                            style={styles.avatar}
                        />
                    </View>

                    <View style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity?.user_profile?.name}</Text>
                        <Text style={styles.contributorMeta}>10 contribs.</Text>
                    </View>

                    <Text style={styles.onWayText}>{postedTime}</Text>
                </View>
            </Pressable>
        </View>
    )
}

export default Meetup

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
        gap: 12,
    },
    detailsContainer: {
        gap: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    meetupTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        maxWidth: '80%',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    infoRowCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: -2,
    },
    infoText: {
        fontSize: 12,
        opacity: 0.8,
        color: '#000',
    },
    infoTextWithMargin: {
        fontSize: 12,
        opacity: 0.8,
        color: '#000',
        marginRight: 22,
    },
    descriptionText: {
        fontSize: 14,
        opacity: 0.8,
        color: '#000',
        lineHeight: 20,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    membersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    memberAvatarContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'hidden',
    },
    memberAvatar: {
        width: '100%',
        height: '100%',
    },
    memberCountText: {
        fontSize: 12,
        opacity: 0.7,
        color: '#000',
    },
    directionsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    directionsButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    directionsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    directionsTextContainer: {
        gap: 2,
    },
    directionsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#029baf',
    },
    distanceText: {
        fontSize: 10,
        fontWeight: '700',
        opacity: 0.8,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
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
    onWayText: {
        fontSize: 12,
        opacity: 0.7,
        color: '#000',
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
        color: '#000',
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
