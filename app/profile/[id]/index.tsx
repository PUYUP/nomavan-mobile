import FeedScreen, { FeedScreenRef } from '@/app/(tabs)/feed';
import { BPActivityFilterArgs } from '@/services/activity';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

interface ProfileActivityProps {
    filter?: BPActivityFilterArgs;
}

const ProfileActivity = ({ filter }: ProfileActivityProps) => {
    const params = useLocalSearchParams();
    const userId = params.id as string;
    const filterType = params.filterType as string;
    const feedRef = useRef<FeedScreenRef>(null);
    const [isMounted, setIsMounted] = useState(false);
    
    // Delay feed loading until after navigation transition completes
    // Reset only when userId changes (not filterType)
    useEffect(() => {
        setIsMounted(false);
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 50);
        
        return () => clearTimeout(timer);
    }, [userId]);
    
    // Calculate filter based on filterType - using useMemo instead of useState + useEffect for better performance
    const currentFilter = useMemo((): BPActivityFilterArgs => {
        const baseFilter: BPActivityFilterArgs = {
            ...filter,
            user_id: userId ? parseInt(userId, 10) : undefined,
        };

        switch (filterType) {
            case 'expenses':
                return { ...baseFilter, type: ['new_expense'] };
            case 'routes':
                return { ...baseFilter, type: ['new_route_point'] };
            case 'stories':
                return { ...baseFilter, type: ['new_story'] };
            case 'spothunts':
                return { ...baseFilter, type: ['new_spothunt'] };
            case 'connections':
                return { ...baseFilter, type: ['new_connectivity'] };
            case 'meetups':
                return { ...baseFilter, type: ['created_group', 'joined_group'] };
            case 'all':
            default:
                return baseFilter;
        }
    }, [filterType, userId, filter]);
    
    return (
        <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={true}
        >
            {isMounted ? (
                <FeedScreen 
                    key={`profile-feed-${userId}`}
                    ref={feedRef} 
                    context='profile' 
                    filter={currentFilter} 
                />
            ) : (
                <View style={{ paddingTop: 32, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#1F3D2B" />
                </View>
            )}
        </ScrollView>
    )
}

export default ProfileActivity