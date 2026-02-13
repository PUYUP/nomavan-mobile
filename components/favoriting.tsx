import { BPActivityResponse, useFavoriteActivityMutation } from '@/services/apis/activity-api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const useFavoriting = (activity: BPActivityResponse) => {
    const [favoriteActivity, { isLoading: isFavoriting }] = useFavoriteActivityMutation();
    
    // Local optimistic state
    const [isFavorited, setIsFavorited] = useState(activity.favorited);
    const [favoritedCount, setFavoritedCount] = useState(
        typeof activity.favorited_count === 'number' ? activity.favorited_count : 0
    );

    const toggleFavorite = async () => {
        // Update UI immediately (optimistic update)
        const wasAlreadyFavorited = isFavorited;
        const previousCount = favoritedCount;
        
        if (isFavorited) {
            // Unfavorite
            setIsFavorited(false);
            setFavoritedCount(prev => Math.max(0, prev - 1));
        } else {
            // Favorite
            setIsFavorited(true);
            setFavoritedCount(prev => prev + 1);
        }
        
        try {
            await favoriteActivity(activity.id).unwrap();
        } catch (error) {
            // Rollback on error
            setIsFavorited(wasAlreadyFavorited);
            setFavoritedCount(previousCount);
            console.error('Failed to favorite activity:', error);
        }
    };

    return {
        isFavorited,
        favoritedCount,
        isFavoriting,
        toggleFavorite,
    };
};

type FavoriteButtonProps = {
    activity: BPActivityResponse;
};

export const FavoriteButton = ({ activity }: FavoriteButtonProps) => {
    const { isFavorited, favoritedCount, isFavoriting, toggleFavorite } = useFavoriting(activity);

    return (
        <View style={styles.thanksLeft}>
            <Pressable 
                style={[
                    styles.thanksButton,
                    isFavorited && styles.thanksButtonActive,
                    isFavoriting && styles.thanksButtonDisabled
                ]}
                onPress={toggleFavorite}
                disabled={isFavoriting}
            >
                <View style={styles.thanksContent}>
                    <MaterialCommunityIcons 
                        name={isFavorited ? "thumb-up" : "thumb-up-outline"} 
                        size={14} 
                        color={isFavorited ? "#3b82f6" : "#000"} 
                    />
                    <Text style={[styles.thanksText, isFavorited && styles.thanksTextActive]}>
                        {isFavorited ? 'Thanked' : 'Say Thanks'}
                    </Text>
                </View>
            </Pressable>
            
            {favoritedCount > 0 &&
                <View style={styles.thanksCount}>
                    <Text style={styles.thanksCountText}>{favoritedCount} thanks</Text>
                </View>
            }           
        </View>
    );
};

const styles = StyleSheet.create({
    thanksButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thanksButtonActive: {
        backgroundColor: '#dbeafe',
    },
    thanksButtonDisabled: {
        opacity: 0.5,
    },
    thanksLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    thanksContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    thanksText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
    },
    thanksTextActive: {
        color: '#3b82f6',
    },
    thanksCount: {
        alignItems: 'center',
    },
    thanksCountText: {
        fontSize: 12,
        opacity: 0.7,
        color: '#000',
    },
});
