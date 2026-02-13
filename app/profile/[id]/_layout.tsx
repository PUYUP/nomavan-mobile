import { logout } from "@/services/auth-storage";
import { useGetProfileQuery } from "@/services/profile-api";
import { presentPaywall } from "@/utils/paywall";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Slot, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const ACTIVITY_FILTERS = [
    { type: 'all', label: 'All', icon: 'format-list-bulleted' },
    { type: 'expenses', label: 'Expenses', icon: 'cart-arrow-down' },
    { type: 'routes', label: 'Routes', icon: 'map-marker-path' },
    { type: 'spothunts', label: 'Spot hunts', icon: 'magnify' },
    { type: 'meetups', label: 'Meetups', icon: 'account-group' },
    { type: 'connections', label: 'Connectivity', icon: 'microsoft-internet-explorer' },
    { type: 'stories', label: 'Stories', icon: 'book-open-page-variant' },
] as const;

export default function ProfileLayout() {
    const { id, isMe } = useLocalSearchParams();
    const profileId = typeof id === 'string' ? parseInt(id, 10) : undefined;
    const router = useRouter();
    const [filterType, setFilterType] = useState<string>('all');
    
    const { data: profile, isLoading, error } = useGetProfileQuery(profileId!, {
        skip: !profileId,
    });

    // Update route params when filterType changes
    useEffect(() => {
        router.setParams({ filterType });
    }, [filterType]);

    const getActivity = async (type: string) => {
        setFilterType(type);
    }

    // Subscription handler
    const subscribeHandler = async () => {
        const success = await presentPaywall();
        if (success) {
            // Handle successful purchase or restoration
        } else {
            // Handle cancellation or error
        }
    }

    // Logout handler
    const logoutHandler = async () => {
        await logout();
        router.replace('/(auth)/login');
    }
    
    return (
        <View style={styles.safeArea}>
            <Stack.Screen 
                options={{ 
                    title: isMe === 'true' ? 'My Profile' : 'Profile', 
                    headerTitleStyle: {
                        fontSize: 22,
                        fontFamily: 'Inter-Black',
                        color: '#1F3D2B',
                    },
                    headerBackButtonDisplayMode: 'minimal',
                    headerRight: () => (
                        <>  
                            {isMe === 'true' ?
                                <Pressable 
                                    style={styles.logoutButton}
                                    onPress={async () => await logoutHandler()}
                                >
                                    <MaterialCommunityIcons name="logout" size={20} color="#c1121f" />
                                    <Text style={styles.logoutText}>Logout</Text>
                                </Pressable>
                            :   <Pressable 
                                    style={styles.unlockButton}
                                    onPress={async () => await subscribeHandler()}
                                >
                                    <MaterialCommunityIcons name="lock-check" size={20} color="white" />
                                    <Text style={styles.unlockText}>Unlock</Text>
                                </Pressable>
                            }
                        </>
                    ),
                }} 
            />
            
            <View style={styles.content}>
                {isLoading && (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator color="#1F3D2B" />
                    </View>
                )}
                
                {error && (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>Failed to load profile</Text>
                    </View>
                )}
                
                {profile && (
                    <View style={{ backgroundColor: '#fff', padding: 16 }}>
                        <View style={styles.profileContainer}>
                            <Image 
                                source={{ uri: 'https:' + profile.avatar_urls.full }}
                                style={styles.avatar}
                            />
                            <View style={styles.profileInfo}>
                                <Text style={styles.name}>{profile.name}</Text>
                                <Text style={styles.username}>@{profile.mention_name}</Text>
                            </View>

                            {isMe !== 'true' && (
                                <Pressable 
                                    style={styles.watchButton}
                                >
                                    <MaterialCommunityIcons name="account-tie-voice" size={20} color="#d8a109" />
                                    <Text style={styles.watchText}>Watch</Text>
                                </Pressable>
                            )}
                        </View>

                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterScrollContent}
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
                )}
            </View>

            <Slot />
        </View>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        padding: 0,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 32,
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        fontFamily: 'Inter-Medium',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    profileInfo: {
        flex: 1,
        maxWidth: '60%',
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    name: {
        fontSize: 16,
        color: '#070d09',
        marginBottom: 2,
    },
    username: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#797f8c',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    logoutText: {
        color: '#c1121f',
        fontSize: 14,
        fontWeight: '600',
    },
    unlockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#059669',
    },
    unlockText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    watchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    watchText: {
        color: '#d8a109',
        fontSize: 14,
        fontWeight: '600',
    },
    creatorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: '#059669',
    },
    creatorText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    filterScrollContent: {
        gap: 8,
        paddingVertical: 0,
        paddingBottom: 0,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
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
});