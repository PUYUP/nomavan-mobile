import { BPActivityResponse } from '@/services/activity';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { StyleSheet } from 'react-native';
import { Avatar, Button, Card, Paragraph, Separator, Text, View, XStack, YStack } from 'tamagui';

type StoryUpdateProps = {
    activity: BPActivityResponse;
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').trim();

const StoryUpdate = ({ activity }: StoryUpdateProps) => {
    if (!activity) {
        return;
    }

    const contentText = activity.secondary_item.content.rendered
        ? stripHtml(activity.secondary_item.content.rendered)
        : stripHtml(activity.content.rendered) ?? '';
    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';
    const componentLabel = activity.secondary_item.meta.place_name || null;
    return (
        <>
            <Card style={styles.card}>
                <View>
                    <Paragraph>{contentText || activity.title || '-'}</Paragraph>
                </View>

                <Separator my={10} />

                <XStack style={styles.contributorRow}>
                    <Avatar circular size="$4" style={styles.avatar}>
                        <Avatar.Image
                            src={'https:' + activity.user_avatar?.thumb}
                            accessibilityLabel="Contributor avatar"
                        />
                        <Avatar.Fallback />
                    </Avatar>

                    <YStack style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity.user_profile?.name}</Text>
                        <Text style={styles.contributorMeta}>10 contribs.</Text>
                    </YStack>

                    <YStack maxW={120} style={styles.locationColumn}>
                        {componentLabel ?
                            <XStack style={styles.locationRow}>
                                <MaterialCommunityIcons name="map-marker-radius" size={16} />
                                <Text style={styles.locationText} numberOfLines={1}>{componentLabel}</Text>
                            </XStack>
                            : null
                        }
                        <Text style={styles.postedTime}>{postedTime}</Text>
                    </YStack>
                </XStack>

                <Separator my={10} />

                <XStack style={styles.thanksRow}>
                    <XStack style={styles.thanksLeft}>
                        <Button size="$2" style={styles.thanksButton}>
                            <XStack style={styles.thanksContent}>
                                <MaterialCommunityIcons name="thumb-up" size={14} />
                                <Text style={styles.thanksText}>Say Thanks</Text>
                            </XStack>
                        </Button>

                        <View style={styles.thanksCount}>
                            <Text style={styles.thanksCountText}>97 thanks</Text>
                        </View>
                    </XStack>
                </XStack>
            </Card>
        </>
    )
}

export default StoryUpdate

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    row: {
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
    },
    subtitle: {
        fontSize: 10,
        opacity: 0.8,
        textAlign: 'center',
    },
    contributorRow: {
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    contributorInfo: {
        flex: 1,
        gap: 2,
    },
    contributorName: {
        fontSize: 14,
        fontWeight: '700',
    },
    contributorMeta: {
        fontSize: 12,
        opacity: 0.8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationColumn: {
        alignItems: 'flex-end',
        gap: 2,
    },
    locationText: {
        fontSize: 12,
        opacity: 0.9,
    },
    postedTime: {
        fontSize: 11,
        opacity: 0.7,
    },
    thanksButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
    },
    thanksRow: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    thanksLeft: {
        alignItems: 'center',
        gap: 8,
    },
    thanksContent: {
        alignItems: 'center',
        gap: 6,
    },
    thanksText: {
        fontSize: 12,
        fontWeight: '600',
    },
    thanksCount: {
        alignItems: 'center',
    },
    thanksCountText: {
        fontSize: 12,
        opacity: 0.7,
    },
})