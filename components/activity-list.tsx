import ArrivedOnSite from '@/components/activity/arrived-on-site';
import ConnectivityUpdate from '@/components/activity/connectivity-update';
import ExpenseUpdate from '@/components/activity/expense-update';
import Meetup from '@/components/activity/meetup';
import OnTheWay from '@/components/activity/on-the-way';
import SpothuntPin from '@/components/activity/spothunt-pin';
import StoryUpdate from '@/components/activity/story-update';
import { BPActivityFilterArgs, BPActivityResponse, useGetActivitiesQuery } from '@/services/apis/activity-api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACTIVITY_FILTERS = [
  { type: 'all', label: 'All', icon: 'format-list-bulleted' },
  { type: 'new_expense', label: 'Expenses', icon: 'cart-arrow-down' },
  { type: 'new_route_point', label: 'Routes', icon: 'map-marker-path' },
  { type: 'new_spothunt', label: 'Spots', icon: 'map-marker-question-outline' },
  { type: 'created_group', label: 'Meetups', icon: 'account-group' },
  { type: 'new_connectivity', label: 'Signal', icon: 'microsoft-internet-explorer' },
  { type: 'new_story', label: 'Stories', icon: 'book-open-page-variant' },
] as const;

type ActivityListProps = {
    userId?: number;
};

const ActivityList = ({ userId }: ActivityListProps = {}) => {
    const [filterType, setFilterType] = useState<string>('all');
    const [page, setPage] = useState<number>(1);

    const getActivityTypes = (filterType: string) => {
        if (filterType === 'all') {
            return [
                'new_expense',
                'new_route_point',
                'new_connectivity',
                'new_story',
                'new_spothunt',
                'created_group'
            ];
        }

        return [filterType];
    };

    const filters: BPActivityFilterArgs = {
        page: page,
        per_page: 50,
        type: getActivityTypes(filterType),
        ...(userId && { user_id: userId }),
    };

    const { data, isLoading, isFetching, isError, refetch } = useGetActivitiesQuery(filters, {
        refetchOnMountOrArgChange: 0, // Cache for 30 seconds
    });

    const getActivity = (filterType: string) => {
        setFilterType(filterType);
        setPage(1); // Reset to page 1 when filter changes
    };

    // Show loading only on first load, not on filter changes
    if (isLoading && !data) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1F3D2B" />
                </View>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.errorText}>Error loading activities.</Text>
                        <Pressable onPress={() => refetch()} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const renderItem = ({ item }: { item: BPActivityResponse }) => {
        if (item.type === 'new_expense') {
            return <ExpenseUpdate activity={item} />;
        }

        if (item.type === 'new_route_point') {
            if (item.secondary_item.meta.arrived_at) {
                return <ArrivedOnSite activity={item} />;
            }
            return <OnTheWay activity={item} />;
        }

        if (item.type === 'new_connectivity') {
            return <ConnectivityUpdate activity={item} />;
        }

        if (item.type === 'new_story') {
            return <StoryUpdate activity={item} />;
        }

        if (item.type === 'new_spothunt') {
            return <SpothuntPin activity={item} />;
        }

        if (item.type === 'created_group') {
            return <Meetup activity={item} />;
        }

        return (
            <View style={styles.itemContainer}>
                <Text style={styles.itemText}>{item.type || 'Activity'}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
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

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No activities found</Text>
                    </View>
                }
            />

            {isFetching && !isLoading && (
                <View style={styles.fetchingOverlay}>
                    <ActivityIndicator size="small" color="#1F3D2B" />
                </View>
            )}
        </SafeAreaView>
    );
}

export default ActivityList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#1F3D2B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
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
    fetchingOverlay: {
        position: 'absolute',
        top: 60,
        right: 16,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});