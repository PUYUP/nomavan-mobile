import Meetup from '@/components/activity/meetup';
import { BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/activity';
import { useCreateMeetupMutation, useJoinMeetupMutation, useLeaveMeetupMutation } from '@/services/meetup';
import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, YStack } from 'tamagui';

export default function MeetupScreen() {
  const activitiesQueryArgs: BPActivityFilterArgs = { 
    page: 1,
    per_page: 50,
    component: 'groups',
    type: ['created_group'],
  };
  const { data, isLoading, error, refetch } = useGetActivitiesQuery(activitiesQueryArgs);
  const [, joinMeetupResult] = useJoinMeetupMutation({ fixedCacheKey: 'join-meetup-process' });
  const [, leaveMeetupResult] = useLeaveMeetupMutation({ fixedCacheKey: 'leave-meetup-process' });
  const [, createMeetupResult] = useCreateMeetupMutation({ fixedCacheKey: 'create-meetup-process' });

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
    <Animated.ScrollView style={{ padding: 16 }}>
      {isLoading ? (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4" gap="$2">
          <ActivityIndicator />
          <Text opacity={0.7}>Loading meetups...</Text>
        </YStack>
      ) : error ? (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4" gap="$2">
          <Text color="$red10">Failed to load meetups.</Text>
          <Text opacity={0.7} onPress={() => refetch()}>
            Tap to retry
          </Text>
        </YStack>
      ) : data && data.length > 0 ? (
        <YStack gap="$3" paddingBlockEnd="$4">
          {data.map((activity) => (
            <React.Fragment key={activity.id}>
              {activity.type === 'created_group'
                ? <Meetup activity={activity} />
                : null
              }
            </React.Fragment>
          ))}
        </YStack>
      ) : (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4">
          <Text opacity={0.7}>No meetups yet.</Text>
        </YStack>
      )}
    </Animated.ScrollView>
  );
}
