import { BPActivityResponse } from '@/services/apis/activity-api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { FavoriteButton } from '../favoriting';

type StoryUpdateProps = {
    activity: BPActivityResponse;
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const StoryUpdate = ({ activity }: StoryUpdateProps) => {
    if (!activity) {
        return;
    }

    const router = useRouter();
    const { width } = useWindowDimensions();

    const contentText = activity.secondary_item.content.rendered
        ? stripHtml(activity.secondary_item.content.rendered)
        : stripHtml(activity.content.rendered) ?? '';
    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';
    const componentLabel = activity.secondary_item.meta.place_name || null;
    return (
        <View style={styles.card}>
            <View style={{ marginBottom: 10 }}>
                <RenderHTML baseStyle={{ fontSize: 16 }} contentWidth={width - 58} source={{ html: activity.secondary_item.content.rendered || activity.content.rendered || '' }} />
            </View>

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
                <FavoriteButton activity={activity} />
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
    thanksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
})