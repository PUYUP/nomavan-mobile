import { useGetMembersQuery } from '@/services/members-api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Search, User } from '@tamagui/lucide-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Input, Text, View, XStack, YStack } from 'tamagui';

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
        <Card 
            padding="$3" 
            backgroundColor="white" 
            borderRadius="$3" 
            marginBottom="$3"
            onPress={() => router.push(`/profile/${item.id}`)}
            pressStyle={{ backgroundColor: '$gray2' }}
        >
            <XStack gap="$3" alignItems="center">
                <Avatar circular size="$4">
                    <Avatar.Image 
                        src={'https:' + (item.avatar_urls?.full || item.avatar_urls?.thumb)}
                        accessibilityLabel={item.name}
                    />
                    <Avatar.Fallback backgroundColor="$gray5">
                        <User size={24} color="#6b7280" />
                    </Avatar.Fallback>
                </Avatar>
                
                <YStack flex={1} gap="$1.5">
                    <XStack items={'center'} gap={'$2'}>
                        <Text fontSize="$3" fontWeight="600" color="$gray12">
                            {item.name}
                        </Text>
                        <Text fontSize="$2" color="$gray10">
                            @{item.mention_name || item.user_login}
                        </Text>
                    </XStack>
                    {item.last_activity && (
                        <XStack gap="$2" alignItems="center">
                            <MaterialCommunityIcons 
                                name="clock-outline" 
                                size={14} 
                                color="#6b7280" 
                            />
                            <Text fontSize="$2" color="$gray10">
                                Active {item.last_activity.timediff}
                            </Text>
                        </XStack>
                    )}
                    {item.total_friend_count !== undefined && (
                        <XStack gap="$2" alignItems="center">
                            <MaterialCommunityIcons 
                                name="account-group" 
                                size={14} 
                                color="#6b7280" 
                            />
                            <Text fontSize="$2" color="$gray10">
                                {item.total_friend_count} {item.total_friend_count === 1 ? 'friend' : 'friends'}
                            </Text>
                        </XStack>
                    )}
                </YStack>

                <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24}
                    color="#9ca3af"
                />
            </XStack>
        </Card>
    );

    const renderEmpty = () => (
        <YStack alignItems="center" paddingTop="$8" gap="$2">
            <User size={48} color="#9ca3af" />
            <Text fontSize="$4" color="$gray10">
                {debouncedSearch ? 'No members found' : 'Search for members'}
            </Text>
            {debouncedSearch && (
                <Text fontSize="$3" color="$gray9" textAlign="center" paddingHorizontal="$4">
                    Try adjusting your search or filter
                </Text>
            )}
        </YStack>
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
                <View padding="$3" backgroundColor="white" borderBottomWidth={1} borderBottomColor="$gray4">
                    <XStack gap="$2" alignItems="center" backgroundColor="$gray2" borderRadius="$3" paddingHorizontal="$3">
                        <Search size={20} color="#6b7280" />
                        <Input
                            flex={1}
                            placeholder="Search members..."
                            value={searchQuery}
                            onChangeText={handleSearch}
                            backgroundColor="transparent"
                            borderWidth={0}
                            fontSize="$4"
                        />
                        {searchQuery.length > 0 && (
                            <Button
                                size="$2"
                                circular
                                chromeless
                                icon={<MaterialCommunityIcons name="close" size={20} color="#6b7280" />}
                                onPress={() => {
                                    setSearchQuery('');
                                    setDebouncedSearch('');
                                    setPage(1);
                                }}
                            />
                        )}
                    </XStack>
                </View>

                {/* Filter Buttons */}
                <View padding="$3" backgroundColor="white" borderBottomWidth={1} borderBottomColor="$gray4">
                    <XStack gap="$2" flexWrap="wrap">
                        <Button
                            size="$2"
                            backgroundColor={selectedType === 'newest' ? '$blue9' : '$gray3'}
                            borderRadius="$8"
                            onPress={() => handleTypeFilter('newest')}
                            pressStyle={{ scale: 0.95 }}
                        >
                            <Text 
                                fontSize="$2" 
                                fontWeight="600" 
                                color={selectedType === 'newest' ? 'white' : '$gray11'}
                            >
                                Newest
                            </Text>
                        </Button>
                        <Button
                            size="$2"
                            backgroundColor={selectedType === 'active' ? '$blue9' : '$gray3'}
                            borderRadius="$8"
                            onPress={() => handleTypeFilter('active')}
                            pressStyle={{ scale: 0.95 }}
                        >
                            <Text 
                                fontSize="$2" 
                                fontWeight="600" 
                                color={selectedType === 'active' ? 'white' : '$gray11'}
                            >
                                Active
                            </Text>
                        </Button>
                        <Button
                            size="$2"
                            backgroundColor={selectedType === 'alphabetical' ? '$blue9' : '$gray3'}
                            borderRadius="$8"
                            onPress={() => handleTypeFilter('alphabetical')}
                            pressStyle={{ scale: 0.95 }}
                        >
                            <Text 
                                fontSize="$2" 
                                fontWeight="600" 
                                color={selectedType === 'alphabetical' ? 'white' : '$gray11'}
                            >
                                A-Z
                            </Text>
                        </Button>
                        <Button
                            size="$2"
                            backgroundColor={selectedType === 'popular' ? '$blue9' : '$gray3'}
                            borderRadius="$8"
                            onPress={() => handleTypeFilter('popular')}
                            pressStyle={{ scale: 0.95 }}
                        >
                            <Text 
                                fontSize="$2" 
                                fontWeight="600" 
                                color={selectedType === 'popular' ? 'white' : '$gray11'}
                            >
                                Popular
                            </Text>
                        </Button>
                    </XStack>
                </View>

                {/* Members List */}
                {isLoading && page === 1 ? (
                    <YStack alignItems="center" paddingTop="$8" gap="$2">
                        <ActivityIndicator size="large" />
                        <Text opacity={0.7}>Loading members...</Text>
                    </YStack>
                ) : error ? (
                    <YStack alignItems="center" paddingTop="$8" gap="$3">
                        <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
                        <Text color="$red10" fontSize="$4">Failed to load members</Text>
                        <Button 
                            size="$3" 
                            backgroundColor="$blue9"
                            onPress={() => refetch()}
                        >
                            <Text color="white" fontWeight="600">Retry</Text>
                        </Button>
                    </YStack>
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
                                <YStack padding="$4" alignItems="center">
                                    <ActivityIndicator />
                                </YStack>
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
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
});