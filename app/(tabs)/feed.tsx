import ArrivedOnSite from '@/components/activity/arrived-on-site';
import ConnectivityUpdate from '@/components/activity/connectivity-update';
import ExpenseUpdate from '@/components/activity/expense-update';
import JoinedGroup from '@/components/activity/joined-group';
import Meetup from '@/components/activity/meetup';
import OnTheWay from '@/components/activity/on-the-way';
import SpotHuntPin from '@/components/activity/spothunt-pin';
import StoryUpdate from '@/components/activity/story-update';
import { BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/activity';
import { useCreateConnectivityMutation } from '@/services/connectivity';
import { useCreateExpenseMutation } from '@/services/expense';
import { useCreateMeetupMutation, useJoinMeetupMutation, useLeaveMeetupMutation } from '@/services/meetup';
import { useCreateRouteContextMutation } from '@/services/route-context';
import { useCreateRoutePointMutation } from '@/services/route-point';
import { useCreateSpothuntMutation } from '@/services/spothunt';
import { useCreateStoryMutation } from '@/services/story';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, YStack } from 'tamagui';

interface FeedScreenProps {
  filter?: BPActivityFilterArgs;
  context?: 'feed' | 'profile' | 'group' | 'explore';
}

export interface FeedScreenRef {
  refetch: () => void;
}

const FeedScreen = React.forwardRef<FeedScreenRef, FeedScreenProps>(
  ({ filter, context = 'feed' }, ref) => {
  const activitiesQueryArgs: BPActivityFilterArgs = { 
    page: 1,
    per_page: 50,
    ...filter
  };
  const [location, setLocation] = useState<{ lat: number, lng: number }>();
  const { data, isLoading, error, refetch } = useGetActivitiesQuery(activitiesQueryArgs);
  const [, joinMeetupResult] = useJoinMeetupMutation({ fixedCacheKey: 'join-meetup-process' });
  const [, leaveMeetupResult] = useLeaveMeetupMutation({ fixedCacheKey: 'leave-meetup-process' });
  const [, createMeetupResult] = useCreateMeetupMutation({ fixedCacheKey: 'create-meetup-process' });
  const [, submitExpenseResult] = useCreateExpenseMutation({ fixedCacheKey: 'submit-expense-process' });
  const [, submitConnectivityResult] = useCreateConnectivityMutation({ fixedCacheKey: 'submit-connectivity-process' });
  const [, shareStoryResult] = useCreateStoryMutation({ fixedCacheKey: 'share-story-process' });
  const [, submitSpothuntResult] = useCreateSpothuntMutation({ fixedCacheKey: 'submit-spothunt-process' });
  const [, createRouteContextResult] = useCreateRouteContextMutation({ fixedCacheKey: 'create-route-context-process' });
  const [, createRoutePointResult] = useCreateRoutePointMutation({ fixedCacheKey: 'create-route-point-process' });

  // Expose refetch function to parent
  useImperativeHandle(ref, () => {
    return {
      refetch,
    };
  });

  // Auto refetch when filter changes
  useEffect(() => {
    refetch();
  }, [JSON.stringify(filter)]);

  useEffect(() => {
    if (
      joinMeetupResult.isSuccess 
      || leaveMeetupResult.isSuccess 
      || createMeetupResult.isSuccess
      || submitExpenseResult.isSuccess
      || submitConnectivityResult.isSuccess
      || shareStoryResult.isSuccess
      || submitSpothuntResult.isSuccess
      || createRouteContextResult.isSuccess
      || createRoutePointResult.isSuccess
    ) {
      refetch();
    }
  }, [
    joinMeetupResult.isSuccess,
    leaveMeetupResult.isSuccess,
    createMeetupResult.isSuccess,
    submitExpenseResult.isSuccess,
    submitConnectivityResult.isSuccess,
    shareStoryResult.isSuccess,
    submitSpothuntResult.isSuccess,
    createRouteContextResult.isSuccess,
    createRoutePointResult.isSuccess
  ]);

  const containerStyle = context === 'profile' 
    ? [styles.container, { padding: 0, backgroundColor: '#fff' }]
    : styles.container;

  const isMutationLoading = 
    joinMeetupResult.isLoading ||
    leaveMeetupResult.isLoading ||
    createMeetupResult.isLoading ||
    submitExpenseResult.isLoading ||
    submitConnectivityResult.isLoading ||
    shareStoryResult.isLoading ||
    submitSpothuntResult.isLoading ||
    createRouteContextResult.isLoading ||
    createRoutePointResult.isLoading;

  const content = (
    <>
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
              {activity.type === 'activity_update' || activity.type === 'new_story'
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

              {activity.type === 'new_spothunt' && activity.component === 'activity'
                ? <SpotHuntPin activity={activity} userLat={location?.lat} userLng={location?.lng} />
                : null
              }

              {activity.type === 'new_route_point' && activity.component === 'activity'
                ? activity.secondary_item?.meta?.arrived_at ? <ArrivedOnSite activity={activity} /> : <OnTheWay activity={activity} />
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
    </>
  );

  if (context === 'profile') {
    return (
      <>
        {content}
        {isMutationLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F3D2B" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          </View>
        )}
      </>
    );
  }

  return (
    <>
      <Animated.ScrollView contentContainerStyle={containerStyle}>
        {content}
      </Animated.ScrollView>
      {isMutationLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1F3D2B" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      )}
    </>
  );
});

FeedScreen.displayName = 'FeedScreen';

export default FeedScreen;

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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Black',
    color: '#1F3D2B',
  },
});

// // Di parent component (index.tsx)
// const feedRef = useRef<FeedScreenRef>(null);

// // Update filter dan trigger refetch otomatis
// const [filter, setFilter] = useState({ user_id: 123 });
// setFilter({ user_id: 456 }); // Auto refetch

// // Atau trigger manual
// feedRef.current?.refetch();