import { BPActivityResponse } from "@/services/activity"
import { formatDistanceToNow } from "date-fns"
import { Image, Platform, StyleSheet, Text, View } from "react-native"

type ComponentProps = {
    activity: BPActivityResponse | null
}

const JoinedGroup = ({
    activity = null,
}: ComponentProps) => {
    return (
        activity ? 
            <View style={styles.card}>
                <View style={styles.contributorRow}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https:' + activity?.user_avatar?.thumb }}
                            style={styles.avatar}
                        />
                    </View>
    
                    <View style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity?.user_profile?.name}</Text>
                        <Text style={styles.contributorMeta}>
                            <Text>Joined the </Text>
                            <Text style={styles.groupName}>{activity.primary_item.name}</Text>
                            <Text> {activity.primary_item.types.includes('meetup') ? 'meetup' : 'group'}</Text>
                        </Text>
                    </View>
    
                    <Text style={styles.onWayText}>
                        {formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true })}
                    </Text>
                </View>
            </View>
        : null
    )
}

export default JoinedGroup

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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
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
    groupName: {
        fontWeight: '700',
        color: '#000',
    },
    onWayText: {
        fontSize: 12,
        opacity: 0.7,
        color: '#000',
    },
});