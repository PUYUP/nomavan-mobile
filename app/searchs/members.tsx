import { useGetMembersQuery } from '@/services/members-api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const SearchMembers = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedType, setSelectedType] = useState<'newest' | 'active' | 'alphabetical' | 'popular'>('newest');

    const { data: members, isLoading, error, refetch } = useGetMembersQuery({
        search: debouncedSearch,
        per_page: 20,
        page,
        type: selectedType,
        populate_extras: true,
    });

    // Debounce search
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const timer = setTimeout(() => {
            setDebouncedSearch(text);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    };

    const handleTypeFilter = (type: typeof selectedType) => {
        setSelectedType(type);
        setPage(1);
        refetch();
    };

    const renderMemberItem = ({ item }: { item: any }) => (
        <Pressable 
            style={styles.memberCard}
            onPress={() => router.push(`/profile/${item.id}`)}
        >
            <View style={styles.memberCardContent}>
                <View style={styles.avatarContainer}>
                    {item.avatar_urls?.full || item.avatar_urls?.thumb ? (
                        <Image 
                            source={{ uri: 'https:' + (item.avatar_urls?.full || item.avatar_urls?.thumb) }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <MaterialCommunityIcons name="account" size={24} color="#6b7280" />
                        </View>
                    )}
                </View>
                
                <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>
                            {item.name}
                        </Text>
                        <Text style={styles.memberUsername}>
                            @{item.mention_name || item.user_login}
                        </Text>
                    </View>
                    {item.last_activity && (
                        <View style={styles.memberMetaRow}>
                            <MaterialCommunityIcons 
                                name="clock-outline" 
                                size={14} 
                                color="#6b7280" 
                            />
                            <Text style={styles.memberMetaText}>
                                Active {item.last_activity.timediff}
                            </Text>
                        </View>
                    )}
                    {item.total_friend_count !== undefined && (
                        <View style={styles.memberMetaRow}>
                            <MaterialCommunityIcons 
                                name="account-group" 
                                size={14} 
                                color="#6b7280" 
                            />
                            <Text style={styles.memberMetaText}>
                                {item.total_friend_count} {item.total_friend_count === 1 ? 'friend' : 'friends'}
                            </Text>
                        </View>
                    )}
                </View>

                <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24}
                    color="#9ca3af"
                />
            </View>
        </Pressable>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>
                {debouncedSearch ? 'No members found' : 'Search for members'}
            </Text>
            {debouncedSearch && (
                <Text style={styles.emptySubtitle}>
                    Try adjusting your search or filter
                </Text>
            )}
        </View>
    );

    return (
        <>
            <Stack.Screen 
                options={{ 
                    title: 'Members', 
                    headerTitleStyle: {
                        fontSize: 22,
                        fontFamily: 'Inter-Black',
                        color: '#1F3D2B',
                    },
                    headerBackButtonDisplayMode: 'minimal',
                }} 
            />
            
            <View style={styles.container}>
                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search members..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable
                                style={styles.clearButton}
                                onPress={() => {
                                    setSearchQuery('');
                                    setDebouncedSearch('');
                                    setPage(1);
                                }}
                            >
                                <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Filter Buttons */}
                <View style={styles.filterContainer}>
                    <View style={styles.filterButtonsRow}>
                        <Pressable
                            style={[styles.filterButton, selectedType === 'newest' && styles.filterButtonActive]}
                            onPress={() => handleTypeFilter('newest')}
                        >
                            <Text style={[styles.filterButtonText, selectedType === 'newest' && styles.filterButtonTextActive]}>
                                Newest
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.filterButton, selectedType === 'active' && styles.filterButtonActive]}
                            onPress={() => handleTypeFilter('active')}
                        >
                            <Text style={[styles.filterButtonText, selectedType === 'active' && styles.filterButtonTextActive]}>
                                Active
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.filterButton, selectedType === 'alphabetical' && styles.filterButtonActive]}
                            onPress={() => handleTypeFilter('alphabetical')}
                        >
                            <Text style={[styles.filterButtonText, selectedType === 'alphabetical' && styles.filterButtonTextActive]}>
                                A-Z
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.filterButton, selectedType === 'popular' && styles.filterButtonActive]}
                            onPress={() => handleTypeFilter('popular')}
                        >
                            <Text style={[styles.filterButtonText, selectedType === 'popular' && styles.filterButtonTextActive]}>
                                Popular
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Members List */}
                {isLoading && page === 1 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loadingText}>Loading members...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
                        <Text style={styles.errorText}>Failed to load members</Text>
                        <Pressable 
                            style={styles.retryButton}
                            onPress={() => refetch()}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlatList
                        data={members || []}
                        renderItem={renderMemberItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={renderEmpty}
                        onEndReached={() => {
                            if (members && members.length >= 20) {
                                setPage(prev => prev + 1);
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            isLoading && page > 1 ? (
                                <View style={styles.footerLoading}>
                                    <ActivityIndicator />
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
        </>
    );
};

export default SearchMembers;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    searchContainer: {
        padding: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#000',
    },
    clearButton: {
        padding: 4,
    },
    filterContainer: {
        padding: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    filterButtonsRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
    },
    filterButtonActive: {
        backgroundColor: '#2563eb',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    filterButtonTextActive: {
        color: 'white',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    memberCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    memberCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberInfo: {
        flex: 1,
        gap: 6,
    },
    memberNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    memberName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    memberUsername: {
        fontSize: 13,
        color: '#6b7280',
    },
    memberMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    memberMetaText: {
        fontSize: 13,
        color: '#6b7280',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 64,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingTop: 64,
        gap: 8,
    },
    loadingText: {
        opacity: 0.7,
        color: '#000',
    },
    errorContainer: {
        alignItems: 'center',
        paddingTop: 64,
        gap: 12,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
    },
    retryButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
    footerLoading: {
        padding: 16,
        alignItems: 'center',
    },
});