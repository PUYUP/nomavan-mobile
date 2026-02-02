import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet } from 'react-native';
import { Avatar, Button, Card, Separator, Text, View, XStack, YStack } from 'tamagui';

const ExpenseUpdate = () => {
    const items = [
        { name: 'Premium Fuel', price: 22.5, quantity: 3 },
        { name: 'Toll Fee', price: 15.0, quantity: 2 },
        // { name: 'Parking', price: 6.0, quantity: 1 },
        // { name: 'Snacks', price: 4.75, quantity: 4 },
        { name: 'Water Bottles', price: 2.5, quantity: 6 },
    ]

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <>
            <Card style={styles.card}>
                <XStack gap="$3" style={styles.row}>
                    <YStack style={styles.itemsList}>
                        <XStack style={styles.itemsHeader}>
                            <Text style={[styles.itemHeaderText, { textAlign: 'left' }]}>Items</Text>
                            <Text style={[styles.itemHeaderText, { textAlign: 'right' }]}>Price ($) x Qty</Text>
                            <Text style={styles.itemHeaderText}>Sub-total ($)</Text>
                        </XStack>

                        {items.map((item) => {
                            const subtotal = item.price * item.quantity

                            return (
                                <XStack key={item.name} style={styles.itemRow}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemValue}>
                                        {item.price.toFixed(2)} x {item.quantity}
                                    </Text>
                                    <Text style={styles.itemValue}>{subtotal.toFixed(2)}</Text>
                                </XStack>
                            )
                        })}

                        <XStack style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total ($)</Text>
                            <Text style={styles.totalValue}>{total.toFixed(2)}</Text>
                        </XStack>
                    </YStack>
                </XStack>

                <Separator my={10} />

                <XStack style={styles.contributorRow}>
                    <Avatar circular size="$3" style={styles.avatar}>
                        <Avatar.Image
                            src="https://i.pravatar.cc/100?img=11"
                            accessibilityLabel="Contributor avatar"
                        />
                        <Avatar.Fallback />
                    </Avatar>

                    <YStack style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>Adam Zaidan</Text>
                        <Text style={styles.contributorMeta}>1.276 contribs.</Text>
                    </YStack>

                    <YStack style={styles.locationColumn}>
                        <XStack style={styles.locationRow}>
                            <MaterialCommunityIcons
                                name="storefront-outline"
                                size={16}
                            />
                            <Text style={styles.locationText}>Wawa & Sheetz</Text>
                        </XStack>
                        <Text style={styles.postedTime}>1 day ago - sedona az</Text>
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

                    <Button size="$2" style={styles.viewLocationButton}>
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
        marginBottom: 16,
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
        width: '33%',
        textAlign: 'right',
    },
    itemRow: {
        justifyContent: 'space-between',
    },
    itemName: {
        width: '33%',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'left',
    },
    itemValue: {
        width: '33%',
        fontSize: 12,
        textAlign: 'right',
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