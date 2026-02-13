import { BPActivityResponse, useFavoriteActivityMutation } from '@/services/activity';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type ExpenseUpdateProps = {
    activity?: BPActivityResponse | null;
};

const ExpenseUpdate = ({ activity = null }: ExpenseUpdateProps) => {
    if (!activity) {
        return null;
    }

    const router = useRouter();
    const postedTime = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: false, includeSeconds: true }) : '';
    const total = activity.secondary_item.meta.expense_items_inline.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const [favoriteActivity, { isLoading: isFavoriting }] = useFavoriteActivityMutation();

    const handleOpenDirections = (item: BPActivityResponse | null) => {
        const latitude = item?.secondary_item?.meta?.latitude;
        const longitude = item?.secondary_item?.meta?.longitude;

        if (!latitude || !longitude) return

        const query = encodeURIComponent(`${latitude},${longitude}`)
        const label = encodeURIComponent(item?.secondary_item?.meta?.place_name)
        const url = Platform.OS === 'ios'
            ? `http://maps.apple.com/?ll=${query}&q=${label}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`

        Linking.openURL(url)
    }

    const favoriteHandler = async (item: BPActivityResponse) => {
        try {
            await favoriteActivity(item.id).unwrap();
        } catch (error) {
            console.error('Failed to favorite activity:', error);
        }
    }

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.itemsList}>
                    {activity.secondary_item.meta.expense_items_inline.map((item: any) => {
                        const subtotal = item.price * item.quantity

                        return (
                            <View key={item.name} style={styles.itemRow}>
                                <View style={styles.itemNameContainer}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemValue}>
                                        <Text style={styles.itemPrice}>{item.price.toFixed(2)}</Text> x {item.quantity}
                                    </Text>
                                </View>

                                <Text style={styles.itemSubtotal}>{subtotal.toFixed(2)}</Text>
                            </View>
                        )
                    })}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{total.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.separator} />
            
            <Pressable onPress={() => router.push(`/profile/${activity.user_id}`)}>
                <View style={styles.contributorRow}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https:' + activity.user_avatar.thumb }}
                            style={styles.avatar}
                        />
                    </View>

                    <View style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>{activity.user_profile.name}</Text>
                        <Text style={styles.contributorMeta}>78 expenses</Text>
                    </View>

                    <View style={styles.locationColumn}>
                        {activity.secondary_item.meta.store_name ? 
                            <View style={styles.locationRow}>
                                <MaterialCommunityIcons
                                    name="storefront-outline"
                                    size={16}
                                    color="#000"
                                />
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {activity.secondary_item.meta.store_name}
                                </Text>
                            </View>
                            : null
                        }

                        <Text 
                            style={styles.postedTime}
                            numberOfLines={activity.secondary_item.meta.store_name ? 1 : 2}
                        >
                            {postedTime} {activity.secondary_item.meta.place_name ? ' - ' + activity.secondary_item.meta.place_name : null}
                        </Text>
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
                        onPress={async () => favoriteHandler(activity)}
                        disabled={isFavoriting}
                    >
                        <View style={styles.thanksContent}>
                            <MaterialCommunityIcons 
                                name={activity.favorited ? "thumb-up" : "thumb-up-outline"} 
                                size={14} 
                                color={activity.favorited ? "#3b82f6" : "#000"} 
                            />
                            <Text style={[
                                styles.thanksText,
                                activity.favorited && styles.thanksTextActive
                            ]}>
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

                <Pressable style={styles.viewLocationButton} onPress={() => handleOpenDirections(activity)}>
                    <View style={styles.thanksContent}>
                        <MaterialCommunityIcons name="map" size={14} color="#3b82f6" />
                        <Text style={styles.viewLocationText}>Location</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

export default ExpenseUpdate

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
    itemsList: {
        flex: 1,
        gap: 8,
    },
    itemsHeader: {
        flexDirection: 'row',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemNameContainer: {
        width: '70%',
    },
    itemName: {
        width: '100%',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'left',
        marginBottom: 3,
        color: '#000',
    },
    itemValue: {
        width: '100%',
        fontSize: 12,
        opacity: 0.9,
        color: '#000',
    },
    itemPrice: {
        color: '#f97316',
        fontWeight: '700',
    },
    itemSubtotal: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10b981',
    },
    totalRow: {
        flexDirection: 'row',
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
        color: '#000',
    },
    totalValue: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'right',
        color: '#ef4444',
    },
    separator: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 10,
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
        maxWidth: 140,
    },
    locationColumn: {
        alignItems: 'flex-end',
        gap: 2,
    },
    locationText: {
        fontSize: 12,
        opacity: 0.9,
        paddingRight: 10,
        color: '#000',
        maxWidth: 120,
    },
    postedTime: {
        fontSize: 11,
        opacity: 0.7,
        maxWidth: 140,
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
    viewLocationButton: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewLocationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
    },
})