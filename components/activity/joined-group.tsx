import { BPActivityResponse } from "@/services/activity"
import { formatDistanceToNow } from "date-fns"
import { StyleSheet } from "react-native"
import { Avatar, Card, Text, XStack, YStack } from "tamagui"

type ComponentProps = {
    activity: BPActivityResponse | null
}

const JoinedGroup = ({
    activity = null,
}: ComponentProps) => {
    return (
        activity ? 
            <Card style={styles.card}>
                <XStack style={styles.contributorRow}>
                    <Avatar circular size="$4" style={styles.avatar}>
                        <Avatar.Image
                            src={'https:' + activity?.user_avatar?.thumb}
                            accessibilityLabel={activity.user_profile.name}
                        />
                        <Avatar.Fallback />
                    </Avatar>
    
                    <YStack style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity?.user_profile?.name}</Text>
                        <Text style={styles.contributorMeta}>
                            <Text>Joined the</Text> <Text fontWeight={700}>{activity.primary_item.name}</Text> <Text>{activity.primary_item.types.includes('meetup') ? 'meetup' : 'group'}</Text>
                        </Text>
                    </YStack>
    
                    <Text style={styles.onWayText}>
                        {formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true })}
                    </Text>
                </XStack>
            </Card>
        : null
    )
}

export default JoinedGroup

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    row: {
        alignItems: 'center',
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
    onWayText: {
        fontSize: 12,
        opacity: 0.7,
    },
});