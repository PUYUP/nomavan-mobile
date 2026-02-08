import Meetup from '@/components/activity/meetup';
import PostUpdate from '@/components/activity/post-update';
import { useGetActivitiesQuery } from '@/services/activity';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, YStack } from 'tamagui';

export default function FeedScreen() {
  const { data, isLoading, error, refetch } = useGetActivitiesQuery({ per_page: 20 });

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
