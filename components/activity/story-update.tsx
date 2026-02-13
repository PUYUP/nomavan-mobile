import { BPActivityResponse, useFavoriteActivityMutation } from '@/services/activity';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type StoryUpdateProps = {
    activity: BPActivityResponse;
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const StoryUpdate = ({ activity }: StoryUpdateProps) => {
    if (!activity) {
        return;
    }

    const router = useRouter();
    const [favoriteActivity, { isLoading: isFavoriting }] = useFavoriteActivityMutation();

    const favoriteHandler = async (item: BPActivityResponse) => {
        try {
            await favoriteActivity(item.id).unwrap();
        } catch (error) {
            console.error('Failed to favorite activity:', error);
        }
    }

    const contentText = activity.secondary_item.content.rendered
        ? stripHtml(activity.secondary_item.content.rendered)
        : stripHtml(activity.content.rendered) ?? '';
    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';
    const componentLabel = activity.secondary_item.meta.place_name || null;
    return (
        <View style={styles.card}>
            <View>
                <Text style={styles.contentText}>{contentText || activity.title || '-'}</Text>
            </View>

            <View style={styles.separator} />

            <Pressable onPress={() => router.push(`/profile/${activity.user_id}`)}>
                <View style={styles.contributorRow}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https:' + activity.user_avatar?.thumb }}
                            style={styles.avatar}
                        />
                    </View>

                    <View style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity.user_profile?.name}</Text>
                        <Text style={styles.contributorMeta}>10 stories</Text>
                    </View>

                    <View style={styles.locationColumn}>
                        {componentLabel ?
                            <View style={styles.locationRow}>
                                <MaterialCommunityIcons name="map-marker-radius" size={16} color="#000" />
                                <Text style={styles.locationText} numberOfLines={1}>{componentLabel}</Text>
                            </View>
                            : null
                        }
                        <Text style={styles.postedTime}>{postedTime}</Text>
                    </View>
                </View>
            </Pressable>

            <View style={styles.separator} />

            <View style={styles.thanksRow}>
                <View style={styles.thanksLeft}>
                    <Pressable 
                        style={[
                            styles.thanksButton,
                            activity.favorited && styles.thanksButtonActive,
                            isFavoriting && styles.thanksButtonDisabled
                        ]}
                        onPress={() => favoriteHandler(activity)}
                        disabled={isFavoriting}
                    >
                        <View style={styles.thanksContent}>
                            <MaterialCommunityIcons 
                                name={activity.favorited ? "thumb-up" : "thumb-up-outline"} 
                                size={14} 
                                color={activity.favorited ? "#3b82f6" : "#000"} 
                            />
                            <Text style={[styles.thanksText, activity.favorited && styles.thanksTextActive]}>
                                {activity.favorited ? 'Thanked' : 'Say Thanks'}
                            </Text>
                        </View>
                    </Pressable>
                    
                    {activity.favorited_count > 0 &&
                        <View style={styles.thanksCount}>
                            <Text style={styles.thanksCountText}>{activity.favorited_count} thanks</Text>
                        </View>
                    }           
                </View>
            </View>
        </View>
    )
}

export default StoryUpdate

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
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
    contentText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#000',
    },
    separator: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    strengthCol: {
        borderRightColor: '#e5e5e5',
        borderRightWidth: 1,
        paddingRight: 12,
    },
    mainIcon: {
        fontSize: 36,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        fontFamily: 'Inter-Black',
        color: '#000',
    },
    subtitle: {
        fontSize: 10,
        opacity: 0.8,
        textAlign: 'center',
        color: '#000',
    },
    contributorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    contributorInfo: {
        flex: 1,
        gap: 2,
    },
    contributorName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    contributorMeta: {
        fontSize: 12,
        opacity: 0.8,
        color: '#000',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationColumn: {
        alignItems: 'flex-end',
        gap: 2,
        maxWidth: 120,
    },
    locationText: {
        fontSize: 12,
        opacity: 0.9,
        color: '#000',
    },
    postedTime: {
        fontSize: 11,
        opacity: 0.7,
        color: '#000',
    },
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
    thanksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
})