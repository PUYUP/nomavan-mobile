import { useGetProfileQuery } from "@/services/profile-api";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, View, XStack, YStack } from "tamagui";

const ACTIVITY_FILTERS = [
    { type: 'all', label: 'All', icon: 'format-list-bulleted' },
    { type: 'expenses', label: 'Expenses', icon: 'cart-arrow-down' },
    { type: 'routes', label: 'Routes', icon: 'map-marker-path' },
    { type: 'meetups', label: 'Meetups', icon: 'account-group' },
    { type: 'stories', label: 'Stories', icon: 'book-open-page-variant' },
    { type: 'spothunts', label: 'Spothunts', icon: 'magnify' },
] as const;

async function presentPaywall(): Promise<boolean> {
    // Present paywall for current offering:
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

    switch (paywallResult) {
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
            return false;
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
            return true;
        default:
            return false;
    }
}

export default function ProfileLayout() {
    const { id } = useLocalSearchParams();
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
    
    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Stack.Screen 
                options={{ 
                    title: 'Profile', 
                    headerTitleStyle: {
                        fontSize: 22,
                        fontFamily: 'Inter-Black',
                        color: '#1F3D2B',
                    },
                    headerBackButtonDisplayMode: 'minimal',
                    headerRight: () => (
                        <Button 
                            size={'$2'}
                            bg={'$green10'}
                            pressStyle={{ bg: '$green11' }}
                            style={{ color: 'white' }}
                            icon={<MaterialCommunityIcons name="lock-check" size={20} style={{ color: 'white' }} />}
                            onPress={async () => await subscribeHandler()}
                        >
                            <Text color={'white'}>Unlock</Text>
                        </Button>
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
                    <YStack>
                        <XStack style={styles.profileContainer} items="center" gap={16}>
                            <Image 
                                source={{ uri: 'https:' + profile.avatar_urls.full }}
                                style={styles.avatar}
                            />
                            <YStack maxW={'60%'} flex={1}>
                                <Text style={styles.name}>{profile.name}</Text>
                                <Text style={styles.username}>@{profile.mention_name}</Text>
                            </YStack>

                            <Button 
                                size={'$3'}
                                bg={'transparent'}
                                pressStyle={{ bg: '$orange3' }}
                                color={'$orange11'}
                                icon={<MaterialCommunityIcons name="account-tie-voice" size={20} style={{ color: '#d8a109' }} />}
                            >Tune</Button>
                        </XStack>

                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, paddingVertical: 12, paddingBottom: 0 }}
                        >
                            {ACTIVITY_FILTERS.map((filter) => (
                                <Button 
                                    key={filter.type}
                                    size="$2" 
                                    variant="outlined"
                                    borderColor={filterType === filter.type ? '#1F3D2B' : '$borderColor'}
                                    bg={filterType === filter.type ? '#F0F9FF' : 'transparent'}
                                    onPress={() => getActivity(filter.type)}
                                    icon={<MaterialCommunityIcons name={filter.icon as any} size={14} />}
                                    px="$2.5"
                                >
                                    {filter.label}
                                </Button>
                            ))}
                        </ScrollView>
                    </YStack>
                )}
            </View>

            {/* TABS */}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { display: "none" },
                }}
            >
                <Tabs.Screen 
                    name="index" 
                    initialParams={{ 
                        userId: profileId,
                        filterType: 'all',
                    }}
                />
            </Tabs>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        fontFamily: 'Inter-Medium',
    },
    profileContainer: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    name: {
        fontSize: 16,
        fontFamily: 'Inter-Black',
        color: '#1F3D2B',
        marginBottom: 2,
    },
    username: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#6B7280',
    },
});