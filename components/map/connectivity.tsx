import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

type ConnectivityCalloutProps = {
    marker: {
        items: any[];
        secondary_item?: any;
        user_profile: any;
    };
};

export const ConnectivityCallout = ({ marker }: ConnectivityCalloutProps) => {
    return (
        <View style={{ gap: 0, padding: 8, width: '100%' }}>
            {/* Store and location info */}
            <View style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color="#626365" marginRight={6} />
                    <Text style={{ flex: 1, fontSize: 13 }} numberOfLines={2}>
                        {marker.secondary_item?.meta?.place_name ? marker.secondary_item?.meta?.place_name : '-'}
                    </Text>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MaterialCommunityIcons name="router-network-wireless" size={22} color="#626365" marginRight={6} />
                    <Text style={{ flex: 1, fontSize: 13 }} numberOfLines={2}>
                        {marker.secondary_item?.meta?.carrier ? marker.secondary_item?.meta?.carrier : '-'}
                    </Text>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MaterialCommunityIcons name="access-point-network" size={22} color="#626365" marginRight={6} />
                    <Text style={{ flex: 1, fontSize: 13 }} numberOfLines={2}>
                        {marker.secondary_item?.meta?.type ? marker.secondary_item?.meta?.type.toUpperCase() : '-'}
                    </Text>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MaterialCommunityIcons name="microsoft-internet-explorer" size={22} color="#626365" marginRight={6} />
                    <Text style={{ flex: 1, fontSize: 13 }} numberOfLines={2}>
                        {marker.secondary_item?.meta?.internet_available ? 'Internet Available' : 'No Internet'}
                    </Text>
                    {marker.secondary_item?.meta?.internet_available && (<Text style={{ textTransform: 'uppercase' }}>{marker.secondary_item?.meta?.generation}</Text>)}
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <MaterialCommunityIcons name="account" size={22} color="#626365" marginRight={6} />
                    <Text style={{ flex: 1, fontSize: 13 }} numberOfLines={1}>
                        {marker.user_profile.name ? marker.user_profile.name : '-'}
                    </Text>
                </View>

                
            </View>
        </View>
    )
};