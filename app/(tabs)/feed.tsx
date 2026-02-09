import ConnectivityUpdate from '@/components/activity/connectivity-update';
import ExpenseUpdate from '@/components/activity/expense-update';
import JoinedGroup from '@/components/activity/joined-group';
import Meetup from '@/components/activity/meetup';
import StoryUpdate from '@/components/activity/story-update';
import { activityApi, BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/activity';
import { useCreateConnectivityMutation } from '@/services/connectivity';
import { useCreateExpenseMutation } from '@/services/expense';
import { getCurrentLocation } from '@/services/location';
import { useCreateMeetupMutation, useJoinMeetupMutation, useLeaveMeetupMutation } from '@/services/meetup';
import { useAppDispatch } from '@/utils/hooks';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, InteractionManager, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, YStack } from 'tamagui';

export default function FeedScreen() {
  const dispatch = useAppDispatch();
  const activitiesQueryArgs: BPActivityFilterArgs = { 
    page: 1,
    per_page: 50
  };
  const [location, setLocation] = useState<{ lat: number, lng: number }>();
  const { data, isLoading, error, refetch } = useGetActivitiesQuery(activitiesQueryArgs);
  const [, joinMeetupResult] = useJoinMeetupMutation({ fixedCacheKey: 'join-meetup-process' });
  const [, leaveMeetupResult] = useLeaveMeetupMutation({ fixedCacheKey: 'leave-meetup-process' });
  const [, createMeetupResult] = useCreateMeetupMutation({ fixedCacheKey: 'create-meetup-process' });
  const [, submitExpenseResult] = useCreateExpenseMutation({ fixedCacheKey: 'submit-expense-process' });
  const [, submitConnectivityResult] = useCreateConnectivityMutation({ fixedCacheKey: 'submit-connectivity-process' });

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
      || submitExpenseResult.isSuccess
      || submitConnectivityResult.isSuccess
    ) {
      refetch();
    }
  }, [
    joinMeetupResult.isSuccess,
    leaveMeetupResult.isSuccess,
    createMeetupResult.isSuccess,
    submitExpenseResult.isSuccess,
    submitConnectivityResult.isSuccess,
  ]);

  useEffect(() => {
    let isActive = true;
    const task = InteractionManager.runAfterInteractions(async () => {
      const location = await getCurrentLocation();
      if (!isActive) {
        return;
      }
      if (location.ok) {
        const coords = location.data.coords;
        setLocation({ lat: coords.latitude, lng: coords.longitude });
      }
    });

    return () => {
      isActive = false;
      task.cancel();
    };
  }, []);

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
                ? <StoryUpdate activity={activity} />
                : null
              }

              {activity.type === 'created_group'
                ? <Meetup activity={activity} userLat={location?.lat} userLng={location?.lng} />
                : null
              }

              {activity.type === 'joined_group'
                ? <JoinedGroup activity={activity} />
                : null
              }

              {activity.type === 'new_expense' && activity.component === 'activity'
                ? <ExpenseUpdate activity={activity} />
                : null
              }

              {activity.type === 'new_connectivity' && activity.component === 'activity'
                ? <ConnectivityUpdate activity={activity} />
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
