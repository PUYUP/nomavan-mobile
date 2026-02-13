import ArrivedOnSite from '@/components/activity/arrived-on-site';
import OnTheWay from '@/components/activity/on-the-way';
import { BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/apis/activity-api';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, YStack } from 'tamagui';

export default function EnRouteScreen() {
  const activitiesQueryArgs: BPActivityFilterArgs = { 
    page: 1,
    per_page: 50,
    // component: 'activity',
    type: ['new_route_point'],
  };
  const { data, isLoading, error, refetch } = useGetActivitiesQuery(activitiesQueryArgs);

  return (
    <Animated.ScrollView style={{ padding: 16 }}>
      {isLoading ? (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4" gap="$2">
          <ActivityIndicator />
          <Text opacity={0.7}>Loading route points...</Text>
        </YStack>
      ) : error ? (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4" gap="$2">
          <Text color="$red10">Failed to load route points.</Text>
          <Text opacity={0.7} onPress={() => refetch()}>
            Tap to retry
          </Text>
        </YStack>
      ) : data && data.length > 0 ? (
        <YStack gap="$3" paddingBlockEnd="$4">
          {data.map((activity) => (
            <React.Fragment key={activity.id}>
              {activity.type === 'new_route_point' && activity.component === 'activity'
                ? activity.secondary_item?.meta?.arrived_at ? <ArrivedOnSite activity={activity} /> : <OnTheWay activity={activity} />
                : null
              }
            </React.Fragment>
          ))}
        </YStack>
      ) : (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4">
          <Text opacity={0.7}>No route points yet.</Text>
        </YStack>
      )}
    </Animated.ScrollView>
  );
}
