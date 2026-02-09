import SpotHuntPin from '@/components/activity/spothunt-pin';
import { BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/activity';
import { useCreateSpothuntMutation } from '@/services/spothunt';
import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, YStack } from 'tamagui';

export default function TabTwoScreen() {
  const pins = [
    {
      title: 'Spot Hunt Pin Dropped',
      coordinates: '34.9121, -111.7114',
      timeAgo: '2 min ago',
      photos: [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=80',
      ],
      morePhotosLabel: '+7',
      placeLabel: 'Placed near Oak Creek',
      visitorsLabel: '10 were here',
      viewPinLabel: 'Find Spot',
      contributorName: 'Samuel Rizal',
      contributorMeta: '1.276 contribs.',
      pinsAddedLabel: '36 Pin Added',
      contributorTimeAgo: '2 minutes ago',
    },
    {
      title: 'Canyon Ridge Pin Spotted',
      coordinates: '34.8653, -111.7635',
      timeAgo: '12 min ago',
      photos: [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=80',
      ],
      morePhotosLabel: '+3',
      placeLabel: 'Placed near Cathedral Rock',
      visitorsLabel: '18 were here',
      viewPinLabel: 'Find Spot',
      contributorName: 'Ava Noura',
      contributorMeta: '842 contribs.',
      pinsAddedLabel: '19 Pin Added',
      contributorTimeAgo: '18 minutes ago',
    },
  ]

  const activitiesQueryArgs: BPActivityFilterArgs = { 
    page: 1,
    per_page: 50,
    component: 'activity',
    type: ['new_spothunt'],
  };
  const { data, isLoading, error, refetch } = useGetActivitiesQuery(activitiesQueryArgs);
  const [, submitSpothuntResult] = useCreateSpothuntMutation({ fixedCacheKey: 'submit-spothunt-process' });

  useEffect(() => {
    if (submitSpothuntResult.isSuccess) {
      refetch();
    }
  }, [
    submitSpothuntResult.isSuccess,
  ]);

  return (
    <Animated.ScrollView style={{ padding: 16 }}>
      {isLoading ? (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4" gap="$2">
          <ActivityIndicator />
          <Text opacity={0.7}>Loading spots...</Text>
        </YStack>
      ) : error ? (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4" gap="$2">
          <Text color="$red10">Failed to load spots.</Text>
          <Text opacity={0.7} onPress={() => refetch()}>
            Tap to retry
          </Text>
        </YStack>
      ) : data && data.length > 0 ? (
        <YStack gap="$3" paddingBlockEnd="$4">
          {data.map((activity) => (
            <React.Fragment key={activity.id}>
              {activity.type === 'new_spothunt'
                ? <SpotHuntPin activity={activity} />
                : null
              }
            </React.Fragment>
          ))}
        </YStack>
      ) : (
        <YStack style={{ alignItems: 'center' }} paddingBlockStart="$4">
          <Text opacity={0.7}>No spots yet.</Text>
        </YStack>
      )}
    </Animated.ScrollView>
  );
}
