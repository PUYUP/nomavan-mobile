import { BPActivityResponse } from '@/services/activity';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { Linking, Platform, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Separator, Text, View, XStack, YStack } from 'tamagui';

type ExpenseUpdateProps = {
    activity?: BPActivityResponse | null;
};

const ExpenseUpdate = ({ activity = null }: ExpenseUpdateProps) => {
    if (!activity) {
        return null;
    }

    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';
    const total = activity.secondary_item.meta.expense_items_inline.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    const handleOpenDirections = (item: BPActivityResponse | null) => {
        const latitude = item?.secondary_item?.meta?.latitude;
        const longitude = item?.secondary_item?.meta?.longitude;

        if (!latitude || !longitude) return

        const query = encodeURIComponent(`${latitude},${longitude}`)
        const label = encodeURIComponent(item?.secondary_item?.meta?.address)
        const url = Platform.OS === 'ios'
            ? `http://maps.apple.com/?ll=${query}&q=${label}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`

        Linking.openURL(url)
    }

    return (
        <>
            <Card style={styles.card}>
                <XStack gap="$3" style={styles.row}>
                    <YStack style={styles.itemsList}>
                        {activity.secondary_item.meta.expense_items_inline.map((item: any) => {
                            const subtotal = item.price * item.quantity

                            return (
                                <XStack key={item.name} style={styles.itemRow}>
                                    <YStack width={'70%'}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemValue}>
                                            {item.price.toFixed(2)} x {item.quantity}
                                        </Text>
                                    </YStack>

                                    <Text fontSize={14}>{subtotal.toFixed(2)}</Text>
                                </XStack>
                            )
                        })}

                        <XStack style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{total.toFixed(2)}</Text>
                        </XStack>
                    </YStack>
                </XStack>

                <Separator my={10} />

                <XStack style={styles.contributorRow}>
                    <Avatar circular size="$4" style={styles.avatar}>
                        <Avatar.Image
                            src={'https:' + activity.user_avatar.thumb}
                            accessibilityLabel="Contributor avatar"
                        />
                        <Avatar.Fallback />
                    </Avatar>

                    <YStack style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity.user_profile.name}</Text>
                        <Text style={styles.contributorMeta}>1.276 contribs.</Text>
                    </YStack>

                    <YStack style={styles.locationColumn}>
                        {activity.secondary_item.meta.store ? 
                            <XStack maxW={140}  style={styles.locationRow}>
                                <MaterialCommunityIcons
                                    name="storefront-outline"
                                    size={16}
                                />
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {activity.secondary_item.meta.store}
                                </Text>
                            </XStack>
                            : null
                        }

                        <Text 
                            style={styles.postedTime} 
                            maxW={140} 
                            numberOfLines={activity.secondary_item.meta.store ? 1 : 2}
                        >
                            {postedTime} {activity.secondary_item.meta.address ? ' - ' + activity.secondary_item.meta.address : null}
                        </Text>
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
                            <Text style={styles.thanksCountText}>1.230 thanks</Text>
                        </View>
                    </XStack>

                    <Button size="$2" style={styles.viewLocationButton} onPress={() => handleOpenDirections(activity)}>
                        <XStack style={styles.thanksContent}>
                            <MaterialCommunityIcons name="map" size={14} />
                            <Text style={styles.thanksText}>See Location</Text>
                        </XStack>
                    </Button>
                </XStack>
            </Card>
        </>
    )
}

export default ExpenseUpdate

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    row: {
        alignItems: 'center',
    },
    itemsList: {
        flex: 1,
        gap: 8,
    },
    itemsHeader: {
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        paddingBottom: 6,
    },
    itemHeaderText: {
        fontSize: 11,
        opacity: 0.7,
        width: '36%',
        textAlign: 'right',
    },
    itemRow: {
        justifyContent: 'space-between',
    },
    itemName: {
        width: '100%',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'left',
    },
    itemValue: {
        width: '100%',
        fontSize: 12,
        fontWeight: 700,
        opacity: 0.9,
    },
    totalRow: {
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
        paddingTop: 8,
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'left',
    },
    totalValue: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'right',
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
        paddingRight: 10,
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
    viewLocationButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#eef2ff',
    },
})