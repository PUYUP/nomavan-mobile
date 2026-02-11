import { ExpenseCallout } from '@/components/map/expense';
import { Text as NText, View as NView } from 'react-native';
import { ConnectivityCallout } from './connectivity';

type MarkerCalloutProps = {
    marker: {
        id: string;
        coordinate: {
            latitude: number;
            longitude: number;
        };
        items: any[];
        secondary_item?: any;
        user_profile: any;
    };
    activityType: string;
};

export const MarkerCallout = ({ marker, activityType }: MarkerCalloutProps) => {
    // Render based on activity type
    if (activityType === 'new_expense') {
        return <ExpenseCallout marker={marker} />;
    } else if (activityType === 'new_connectivity') {
        return <ConnectivityCallout marker={marker} />;
    }

    // Default fallback for other types
    return (
        <NView style={{ gap: 0, padding: 8, width: '100%' }}>
            <NText style={{ fontWeight: '700', fontSize: 14 }}>
                {activityType.replace('new_', '').replace('_', ' ').toUpperCase()}
            </NText>
            <NText style={{ fontSize: 12, color: '#626365', marginTop: 4 }}>
                {marker.user_profile.name || 'Unknown user'}
            </NText>
        </NView>
    );
};
