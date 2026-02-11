import { StyleSheet, View } from 'react-native';

const SIGNAL_COLORS = {
    bad: '#ff817b',
    orange: '#f59e0b',
    medium: '#efbb11',
    good: '#58a86a',
    inactive: '#d1d5db',
} as const;

const clampStrength = (value: number) => Math.min(Math.max(value, 0), 4);

const getSignalColor = (strength: number) => {
    switch (strength) {
        case 0:
            return SIGNAL_COLORS.bad;
        case 1:
            return SIGNAL_COLORS.orange;
        case 2:
            return SIGNAL_COLORS.medium;
        case 3:
        case 4:
        default:
            return SIGNAL_COLORS.good;
    }
};

const SignalMarker = ({ level = 3 }) => {
    const clampedLevel = clampStrength(level);
    const activeColor = getSignalColor(clampedLevel);
    const borderColor = clampedLevel > 0 ? activeColor : SIGNAL_COLORS.inactive;

    return (
        <View style={[styles.container, { borderColor }]}>
            {[8, 12, 16, 20, 24].map((height, index) => {
                const isActive = clampedLevel > 0 && index < clampedLevel;
                const barColor = isActive ? activeColor : SIGNAL_COLORS.inactive;

                return (
                    <View
                        key={`bar-${index}`}
                        style={[
                            styles.bar,
                            { 
                                height: height,
                                backgroundColor: barColor,
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 3,
        backgroundColor: '#fff',
        padding: 6,
        borderRadius: 8,
        borderWidth: 2,
        // borderColor will be set dynamically based on signal strength
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        // Shadow for Android (increased elevation for better visibility)
        elevation: 8,
    },
    bar: {
        width: 4,
        borderRadius: 2,
    },
});

export default SignalMarker;