import { useGetActivityQuery } from '@/services/apis/activity-api';
import { JoinPayload, LeavePayload, MembershipPayload, useJoinMeetupMutation, useLeaveMeetupMutation, useRequestMembershipMutation } from '@/services/apis/meetup-api';
import { getAuth } from '@/services/auth-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Calendar, Clock, MapPin, Users } from '@tamagui/lucide-icons';
import { format, isSameDay, isValid } from 'date-fns';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Avatar, Button, Card, Paragraph, Text, XStack, YStack } from 'tamagui';

const MeetupDetail = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const activityId = typeof id === 'string' ? parseInt(id, 10) : undefined;
    
    const { data: activity, isLoading, error, refetch } = useGetActivityQuery(activityId!, {
        skip: !activityId,
    });

    const [activityData, setActivityData] = useState<any>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    
    const [joinMeetup, { isLoading: isJoining }] = useJoinMeetupMutation();
    const [leaveMeetup, { isLoading: isLeaving }] = useLeaveMeetupMutation();
    const [requestMembership, { isLoading: isRequesting }] = useRequestMembershipMutation();

    useEffect(() => {
        const loadAuth = async () => {
            const auth = await getAuth();
            setCurrentUserId(auth?.user?.id || null);
        };
        loadAuth();
    }, []);

    useEffect(() => {
        if (activity && Array.isArray(activity) && activity.length > 0) {
            setActivityData(activity[0]);
        }
    }, [activity]);

    const meetup = activityData?.primary_item;

    // Format date range
    const startAtRaw = meetup?.start_at ?? '';
    const endAtRaw = meetup?.end_at ?? '';
    const startAt = startAtRaw ? new Date(startAtRaw) : null;
    const endAt = endAtRaw ? new Date(endAtRaw) : null;

    const dateRangeText = startAt && endAt && isValid(startAt) && isValid(endAt)
        ? isSameDay(startAt, endAt)
            ? {
                date: format(startAt, 'MMMM dd, yyyy'),
                time: `${format(startAt, 'hh:mm a')} - ${format(endAt, 'hh:mm a')}`
              }
            : {
                date: `${format(startAt, 'MMM dd, yyyy')} - ${format(endAt, 'MMM dd, yyyy')}`,
                time: `${format(startAt, 'hh:mm a')} - ${format(endAt, 'hh:mm a')}`
              }
        : { date: 'Anytime', time: '' };

    // Strip HTML from description
    const descriptionText = meetup?.description?.rendered
        ? stripHtml(meetup?.description?.rendered)
        : meetup?.description?.raw ?? '';

    const handleOpenDirections = () => {
        const latitude = meetup?.latitude?.trim();
        const longitude = meetup?.longitude?.trim();

        if (!latitude || !longitude) return;

        const query = encodeURIComponent(`${latitude},${longitude}`);
        const label = encodeURIComponent(meetup?.place_name || 'Meetup Location');
        const url = Platform.OS === 'ios'
            ? `http://maps.apple.com/?ll=${query}&q=${label}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`;

        Linking.openURL(url);
    };

    const handleJoinMeetup = async () => {
        if (!meetup || !currentUserId) return;

        // Check if user is member
        if (meetup?.member_detail?.is_member) {
            const leavePayload: LeavePayload = {
                group_id: meetup.id,
                user_id: parseInt(currentUserId),
                context: 'edit',
            };

            const result = await leaveMeetup(leavePayload);
            if (result && result.data) {
                Toast.show({
                    type: 'info',
                    text1: 'Left Meetup',
                    text2: 'You can rejoin anytime!',
                    visibilityTime: 2000,
                });
                refetch();
            }
            return;
        }

        // Join or request membership
        let result = null;
        
        if (meetup.status === 'public') {
            const payload: JoinPayload = {
                group_id: meetup.id,
                context: 'edit',
            };
            result = await joinMeetup(payload);
            
        } else if (meetup.status === 'private') {
            const payload: MembershipPayload = {
                group_id: meetup.id,
                message: '',
            };
            result = await requestMembership(payload);
        }

        if (result && result.data) {
            Toast.show({
                type: 'success',
                text1: meetup.status === 'private' ? 'Request Sent!' : 'Joined Meetup!',
                text2: meetup.status === 'private' 
                    ? 'Waiting for approval from the organizer.'
                    : 'Looking forward to meeting you!',
                visibilityTime: 2000,
            });
            refetch();
        }
    };

    const isMember = meetup?.member_detail?.is_member;
    const isCreator = meetup?.member_detail?.is_creator;
    const memberCount = parseInt(meetup?.member_detail?.count || '0');
    const capacity = parseInt(meetup?.capacity || '0');
    const spotsLeft = capacity > 0 ? capacity - memberCount : null;

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: 'Meetup',
                    headerBackButtonDisplayMode: 'minimal',
                    headerTitleStyle: {
                        fontSize: 22,
                        fontFamily: 'Inter-Black',
                        color: '#1F3D2B',
                    },
                }}
            />

            <ScrollView style={styles.container}>
                {isLoading ? (
                    <YStack alignItems="center" paddingTop="$8" gap="$2">
                        <ActivityIndicator size="large" />
                        <Text opacity={0.7}>Loading meetup...</Text>
                    </YStack>
                ) : error ? (
                    <YStack alignItems="center" paddingTop="$8" gap="$2">
                        <Text color="$red10">Failed to load meetup.</Text>
                    </YStack>
                ) : activityData && meetup ? (
                    <YStack gap="$4" padding="$4" paddingBottom="$8">
                        {/* Title & Join Button */}
                        <Card padding="$4" backgroundColor="white" borderRadius="$4">
                            <YStack gap="$3">
                                {/* Title with Status Badge */}
                                <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
                                    <Text fontSize="$6" fontWeight="700" color="$gray12" lineHeight="$6" flex={1}>
                                        {meetup.name}
                                    </Text>
                                    <Card 
                                        paddingVertical="$1.5" 
                                        paddingHorizontal="$3" 
                                        backgroundColor={meetup.status === 'public' ? '$green2' : '$orange2'}
                                        borderRadius="$8"
                                    >
                                        <Text 
                                            fontSize="$2" 
                                            fontWeight="600" 
                                            color={meetup.status === 'public' ? '$green11' : '$orange11'}
                                            textTransform="capitalize"
                                        >
                                            {meetup.status}
                                        </Text>
                                    </Card>
                                </XStack>

                                <Paragraph>{descriptionText}</Paragraph>
                                
                                {/* Join/Leave Button */}
                                {!isCreator && (
                                    <Button
                                        size="$5"
                                        theme={isMember ? 'red' : 'green'}
                                        backgroundColor={isMember ? '$red9' : '$green9'}
                                        borderRadius="$4"
                                        pressStyle={{ 
                                            backgroundColor: isMember ? '$red10' : '$green10', 
                                            scale: 0.98 
                                        }}
                                        icon={
                                            <MaterialCommunityIcons 
                                                name={isMember ? 'account-minus' : 'account-plus'} 
                                                size={20} 
                                                color="white" 
                                            />
                                        }
                                        onPress={handleJoinMeetup}
                                        disabled={isJoining || isLeaving || isRequesting}
                                        opacity={(isJoining || isLeaving || isRequesting) ? 0.6 : 1}
                                    >
                                        <Text color="white" fontSize="$5" fontWeight="700">
                                            {isJoining || isLeaving || isRequesting 
                                                ? 'Processing...' 
                                                : isMember 
                                                    ? 'Leave Meetup' 
                                                    : meetup.status === 'private' 
                                                        ? 'Request to Join'
                                                        : 'Join Meetup'
                                            }
                                        </Text>
                                    </Button>
                                )}

                                {isCreator && (
                                    <Card backgroundColor="$blue2" padding="$3" borderRadius="$3">
                                        <XStack gap="$2" alignItems="center">
                                            <MaterialCommunityIcons 
                                                name="crown" 
                                                size={20} 
                                                color="#f59e0b" 
                                            />
                                            <Text fontSize="$4" fontWeight="600" color="$blue11">
                                                You're the organizer
                                            </Text>
                                        </XStack>
                                    </Card>
                                )}
                            </YStack>
                        </Card>

                        {/* Date & Time */}
                        <Card padding="$4" backgroundColor="white" borderRadius="$4">
                            <YStack gap="$3">
                                <Text fontSize="$5" fontWeight="700" color="$gray12">
                                    When
                                </Text>
                                <XStack gap="$3" alignItems="flex-start">
                                    <Calendar size={20} color="$green10" style={{ marginTop: 2 }} />
                                    <YStack flex={1} gap="$1">
                                        <Text fontSize="$4" color="$gray11" fontWeight="600">
                                            {dateRangeText.date}
                                        </Text>
                                    </YStack>
                                </XStack>

                                <XStack gap="$3" alignItems="flex-start">
                                    <Clock size={20} color="$green10" style={{ marginTop: 2 }} />
                                    <YStack flex={1} gap="$1">
                                        <Text fontSize="$4" color="$gray11" fontWeight="600">
                                            {dateRangeText.time}
                                        </Text>
                                    </YStack>
                                </XStack>

                                <XStack gap="$3" alignItems="flex-start">
                                    <Users size={20} color="$green10" style={{ marginTop: 2 }} />
                                    <YStack flex={1} gap="$2">
                                        <XStack justifyContent="space-between" alignItems="center">
                                            <Text fontSize="$4" color="$gray11" fontWeight="600">
                                                {capacity > 0 
                                                    ? `${memberCount} / ${capacity} attendees`
                                                    : `${memberCount} attendees (Unlimited)`
                                                }
                                            </Text>
                                        </XStack>
                                    </YStack>
                                </XStack>
                            </YStack>
                        </Card>

                        {/* Location */}
                        <Card padding="$4" backgroundColor="white" borderRadius="$4">
                            <YStack gap="$3">
                                <XStack justifyContent="space-between" alignItems="center">
                                    <Text fontSize="$5" fontWeight="700" color="$gray12">
                                        Location
                                    </Text>
                                    <Button 
                                        size="$2" 
                                        backgroundColor="$blue11"
                                        borderRadius="$3"
                                        onPress={handleOpenDirections}
                                        icon={
                                            <MaterialCommunityIcons 
                                                name="directions" 
                                                size={16} 
                                                color="white" 
                                            />
                                        }
                                    >
                                        <Text color="white" fontSize="$2" fontWeight="600">
                                            Directions
                                        </Text>
                                    </Button>
                                </XStack>
                                <XStack gap="$3" alignItems="flex-start">
                                    <MapPin size={20} color="$green10" style={{ marginTop: 2 }} />
                                    <YStack flex={1} gap="$2">
                                        <Text fontSize="$3" color="$gray11" lineHeight="$2">
                                            {meetup.place_name || 'Location not specified'}
                                        </Text>
                                        {meetup.latitude && meetup.longitude && (
                                            <XStack gap="$4" marginTop="$1">
                                                <Text fontSize="$2" color="$gray10" fontFamily="$mono">
                                                    Lat: {parseFloat(meetup.latitude).toFixed(6)}
                                                </Text>
                                                <Text fontSize="$2" color="$gray10" fontFamily="$mono">
                                                    Lng: {parseFloat(meetup.longitude).toFixed(6)}
                                                </Text>
                                            </XStack>
                                        )}
                                        {meetup.coverage_radius && (
                                            <XStack gap="$2" alignItems="center" marginTop="$1">
                                                <MaterialCommunityIcons 
                                                    name="map-marker-radius" 
                                                    size={16} 
                                                    color="#6b7280" 
                                                />
                                                <Text fontSize="$2" color="$gray10">
                                                    Coverage: {meetup.coverage_radius}m radius
                                                </Text>
                                            </XStack>
                                        )}
                                    </YStack>
                                </XStack>
                            </YStack>
                        </Card>

                        {/* Who's Coming */}
                        {meetup.member_detail?.users && meetup.member_detail.users.length > 0 && (
                            <Card padding="$4" backgroundColor="white" borderRadius="$4">
                                <YStack gap="$3">
                                    <XStack justifyContent="space-between" alignItems="center">
                                        <Text fontSize="$5" fontWeight="700" color="$gray12">
                                            Attendances
                                        </Text>
                                        <Text fontSize="$3" color="$gray10" fontWeight="600">
                                            {memberCount} {memberCount === 1 ? 'person' : 'people'}
                                        </Text>
                                    </XStack>
                                    
                                    <YStack gap="$2">
                                        {meetup.member_detail.users.map((user: any, index: number) => (
                                            <XStack 
                                                key={user.id}
                                                gap="$3" 
                                                alignItems="center" 
                                                padding="$2"
                                                borderRadius="$3"
                                                backgroundColor="$gray1"
                                                pressStyle={{ backgroundColor: '$gray3' }}
                                                onPress={() => router.push(`/profile/${user.id}`)}
                                                cursor="pointer"
                                            >
                                                <Avatar circular size="$3">
                                                    <Avatar.Image 
                                                        src={`https:${user.user_avatar?.thumb}`}
                                                        accessibilityLabel={user.name}
                                                    />
                                                    <Avatar.Fallback backgroundColor="$gray5">
                                                        <MaterialCommunityIcons 
                                                            name="account" 
                                                            size={20}
                                                            color="#6b7280"
                                                        />
                                                    </Avatar.Fallback>
                                                </Avatar>
                                                <YStack flex={1}>
                                                    <Text fontSize="$4" fontWeight="600" color="$gray12">
                                                        {user.name}
                                                    </Text>
                                                </YStack>
                                                <MaterialCommunityIcons 
                                                    name="chevron-right" 
                                                    size={20}
                                                    color="#9ca3af"
                                                />
                                            </XStack>
                                        ))}
                                    </YStack>
                                </YStack>
                            </Card>
                        )}
                    </YStack>
                ) : (
                    <YStack alignItems="center" paddingTop="$8" gap="$2">
                        <Text opacity={0.7}>No meetup found.</Text>
                    </YStack>
                )}
            </ScrollView>
        </>
    );
};

export default MeetupDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();
