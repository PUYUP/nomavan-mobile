import JoinedGroup from '@/components/activity/joined-group';
import Meetup from '@/components/activity/meetup';
import PostUpdate from '@/components/activity/post-update';
import { activityApi, BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/activity';
import { useJoinMeetupMutation, useLeaveMeetupMutation } from '@/services/meetup';
import { useAppDispatch } from '@/utils/hooks';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, YStack } from 'tamagui';

export default function FeedScreen() {
  const dispatch = useAppDispatch();
  const activitiesQueryArgs: BPActivityFilterArgs = { 
    page: 1,
    per_page: 50 
  };
  const { data, isLoading, error, refetch } = useGetActivitiesQuery(activitiesQueryArgs);
  const [, joinMeetupResult] = useJoinMeetupMutation({ fixedCacheKey: 'join-meetup-process' });
  const [, leaveMeetupResult] = useLeaveMeetupMutation({ fixedCacheKey: 'leave-meetup-process' });
  const [, createMeetupResult] = useLeaveMeetupMutation({ fixedCacheKey: 'create-meetup-process' });

  const updateActivityMembership = (primaryItemId: number, isMember: boolean) => {
    dispatch(
        activityApi.util.updateQueryData('getActivities', activitiesQueryArgs, (draftPosts) => {
            const index = draftPosts.findIndex((item) => item.primary_item_id === primaryItemId)
            if (index === -1) {
              return
            }

            const target = draftPosts[index] as any
            if (!target.primary_item) {
              return
            }

            if (!target.primary_item.member_detail) {
              target.primary_item.member_detail = { is_member: isMember, count: 0, users: [] }
            }

            const memberDetail = target.primary_item.member_detail
            memberDetail.is_member = isMember

            const currentCount = Number(memberDetail.count ?? 0)
            if (Number.isFinite(currentCount)) {
              memberDetail.count = Math.max(0, currentCount + (isMember ? 1 : -1))
            }
        }),
    )
  }

  useEffect(() => {
    if (
      joinMeetupResult.isSuccess 
      || leaveMeetupResult.isSuccess 
      || createMeetupResult.isSuccess
    ) {
      refetch();
    }
  }, [
    joinMeetupResult.isSuccess,
    leaveMeetupResult.isSuccess,
    createMeetupResult.isSuccess,
  ]);


  return (
    <Animated.ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4" gap="$2">
          <ActivityIndicator />
          <Text opacity={0.7}>Loading activities...</Text>
        </YStack>
      ) : error ? (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4" gap="$2">
          <Text color="$red10">Failed to load activities.</Text>
          <Text opacity={0.7} onPress={() => refetch()}>
            Tap to retry
          </Text>
        </YStack>
      ) : data && data.length > 0 ? (
        <YStack gap="$3" paddingBlockEnd="$4">
          {data.map((activity) => (
            <React.Fragment key={activity.id}>
              {activity.type === 'activity_update'
                ? <PostUpdate activity={activity} />
                : null
              }

              {activity.type === 'created_group'
                ? <Meetup activity={activity} />
                : null
              }

              {activity.type === 'joined_group'
                ? <JoinedGroup activity={activity} />
                : null
              }
            </React.Fragment>
          ))}
        </YStack>
      ) : (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4">
          <Text opacity={0.7}>No activities yet.</Text>
        </YStack>
      )}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 12,
  },
});
