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
import { setActivityFilter } from '@/utils/activity-filter';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface FeedScreenProps {
  filter?: BPActivityFilterArgs;
  context?: 'feed' | 'profile' | 'group' | 'explore';
}

export interface FeedScreenRef {
  refetch: () => void;
}

const ACTIVITY_FILTERS = [
  { type: 'all', label: 'All', icon: 'format-list-bulleted' },
  { type: 'expenses', label: 'Expenses', icon: 'cart-arrow-down' },
  { type: 'routes', label: 'Routes', icon: 'map-marker-path' },
  { type: 'spothunts', label: 'Spot hunts', icon: 'magnify' },
  { type: 'meetups', label: 'Meetups', icon: 'account-group' },
  { type: 'connections', label: 'Connectivity', icon: 'microsoft-internet-explorer' },
  { type: 'stories', label: 'Stories', icon: 'book-open-page-variant' },
] as const;

// Map UI filter types to API activity types
const FILTER_TYPE_MAP: Record<string, string> = {
  expenses: 'new_expense',
  routes: 'new_route_point',
  connections: 'new_connectivity',
  meetups: 'created_group',
  stories: 'new_story',
  spothunts: 'new_spothunt',
};

const FeedScreen = React.forwardRef<FeedScreenRef, FeedScreenProps>(({ filter, context = 'feed' }, ref) => {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>('all');
  
  const activitiesQueryArgs: BPActivityFilterArgs = { 
    page: 1,
    per_page: 50,
    // component: 'activity',
    ...filter,
    ...(filterType !== 'all' && { type: [FILTER_TYPE_MAP[filterType]] })
  };
  
  const [location, setLocation] = useState<{ lat: number, lng: number }>();
  const { data, isLoading, error, refetch, isSuccess } = useGetActivitiesQuery(activitiesQueryArgs);
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

  // Auto refetch when any mutation completes successfully
  useEffect(() => {
    const anyMutationData = 
      joinMeetupResult.data ||
      leaveMeetupResult.data ||
      createMeetupResult.data ||
      submitExpenseResult.data ||
      submitConnectivityResult.data ||
      shareStoryResult.data ||
      submitSpothuntResult.data ||
      createRouteContextResult.data ||
      createRoutePointResult.data;
    
    if (anyMutationData) {
      refetch();
    }
  }, [
    joinMeetupResult.data,
    leaveMeetupResult.data,
    createMeetupResult.data,
    submitExpenseResult.data,
    submitConnectivityResult.data,
    shareStoryResult.data,
    submitSpothuntResult.data,
    createRouteContextResult.data,
    createRoutePointResult.data
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

  // Update route params when filterType changes
  useEffect(() => {
    router.setParams({ filterType });
  }, [filterType]);

  const getActivity = async (type: string) => {
    setFilterType(type);
    setActivityFilter(type); // Publish filter change
  }

  const content = (
    <>
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator />
          <Text style={styles.loadingActivityText}>Loading activities...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorActivityText}>Failed to load activities.</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : data && data.length > 0 ? (
        <View style={styles.activityList}>
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
        </View>
      ) : (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No activities yet.</Text>
        </View>
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
      <View style={{ backgroundColor: '#fff' }}>
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              gap: 8, 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              paddingBottom: 8,
            }}
        >
          {ACTIVITY_FILTERS.map((filter) => (
              <Pressable 
                key={filter.type}
                style={[
                  styles.filterButton,
                  filterType === filter.type && styles.filterButtonActive
                ]}
                onPress={() => getActivity(filter.type)}
              >
                <MaterialCommunityIcons 
                  name={filter.icon as any} 
                  size={14} 
                  color={filterType === filter.type ? '#1F3D2B' : '#6B7280'}
                />
                <Text style={[
                  styles.filterButtonText,
                  filterType === filter.type && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </Pressable>
          ))}
        </ScrollView>
      </View>

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
  centerContent: {
    alignItems: 'center',
    paddingTop: 16,
    gap: 8,
  },
  activityList: {
    gap: 12,
    paddingBottom: 16,
  },
  loadingActivityText: {
    opacity: 0.7,
    color: '#000',
    fontSize: 14,
  },
  errorActivityText: {
    color: '#DC2626',
    fontSize: 14,
  },
  retryText: {
    opacity: 0.7,
    color: '#000',
    fontSize: 14,
  },
  emptyText: {
    opacity: 0.7,
    color: '#000',
    fontSize: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    borderColor: '#1F3D2B',
    backgroundColor: '#F0F9FF',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#1F3D2B',
    fontWeight: '600',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
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