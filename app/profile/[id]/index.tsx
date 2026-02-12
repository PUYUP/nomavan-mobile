import FeedScreen, { FeedScreenRef } from '@/app/(tabs)/feed';
import { BPActivityFilterArgs } from '@/services/activity';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

interface ProfileActivityProps {
    filter?: BPActivityFilterArgs;
}

const ProfileActivity = ({ filter }: ProfileActivityProps) => {
    const params = useLocalSearchParams();
    const userId = params.userId as string;
    const filterType = params.filterType as string;
    const feedRef = useRef<FeedScreenRef>(null);
    const [currentFilter, setCurrentFilter] = useState<BPActivityFilterArgs>({});
    
    // Update filter based on filterType from parent
    useEffect(() => {
        const baseFilter: BPActivityFilterArgs = {
            ...filter,
            user_id: userId ? parseInt(userId, 10) : undefined,
        };

        switch (filterType) {
            case 'expenses':
                setCurrentFilter({ ...baseFilter, type: ['new_expense'] });
                break;
            case 'routes':
                setCurrentFilter({ ...baseFilter, type: ['new_route_point'] });
                break;
            case 'stories':
                setCurrentFilter({ ...baseFilter, type: ['new_story'] });
                break;
            case 'spothunts':
                setCurrentFilter({ ...baseFilter, type: ['new_spothunt'] });
                break;
            case 'connections':
                setCurrentFilter({ ...baseFilter, type: ['new_connectivity'] });
                break;
            case 'meetups':
                setCurrentFilter({ ...baseFilter, type: ['created_group', 'joined_group'] });
                break;
            case 'all':
            default:
                setCurrentFilter(baseFilter);
                break;
        }
    }, [filterType, userId, filter]);
    
    return (
        <Animated.ScrollView contentContainerStyle={styles.content}>
            <FeedScreen ref={feedRef} context='profile' filter={currentFilter} />
        </Animated.ScrollView>
    )
}

export default ProfileActivity

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
    },
});