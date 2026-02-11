import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text as NText, View as NView } from 'react-native';

type ExpenseCalloutProps = {
    marker: {
        items: any[];
        secondary_item?: any;
        user_profile: any;
    };
};

export const ExpenseCallout = ({ marker }: ExpenseCalloutProps) => {
    return (
        <NView style={{ gap: 0, padding: 8, width: '100%' }}>
            {/* Expense items */}
            <NView style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                {marker.items?.map((item, key) => (
                    <NView key={key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                        <NView style={{ flex: 1 }}>
                            <NText style={{ fontWeight: '700' }}>{item.name}</NText>
                            <NText>{item.quantity}x</NText>
                        </NView>
                        <NText>{item.price}</NText>
                    </NView>
                ))}
            </NView>

            {/* Total */}
            <NView style={{ display: 'flex', flexDirection: 'row', gap: 4, width: '100%', borderTopColor: '#E5E7EB', borderTopWidth: 1, paddingTop: 6, marginTop: 6 }}>
                <NText style={{ flex: 1 }}>Total</NText>
                <NText style={{ fontWeight: '700', color: '#DC2626' }}>
                    {marker.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </NText>
            </NView>

            {/* Store and location info */}
            <NView style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', borderTopColor: '#E5E7EB', borderTopWidth: 1, paddingTop: 6, marginTop: 6 }}>
                <NView style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="store" size={22} color="#626365" marginRight={6} />
                    <NText style={{ flex: 1, fontSize: 13, color: '#626365' }} numberOfLines={2}>
                        {marker.secondary_item?.meta?.store_name ? marker.secondary_item?.meta?.store_name : '-'}
                    </NText>
                </NView>

                <NView style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MaterialCommunityIcons name="map-marker-radius" size={22} color="#626365" marginRight={6} />
                    <NText style={{ flex: 1, fontSize: 13, color: '#626365' }} numberOfLines={2}>
                        {marker.secondary_item?.meta?.place_name ? marker.secondary_item?.meta?.place_name : '-'}
                    </NText>
                </NView>

                <NView style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <MaterialCommunityIcons name="nature-people-outline" size={22} color="#626365" marginRight={6} />
                    <NText style={{ flex: 1, fontSize: 13, color: '#626365' }} numberOfLines={1}>
                        {marker.user_profile.name ? marker.user_profile.name : '-'}
                    </NText>
                </NView>
            </NView>
        </NView>
    );
};
