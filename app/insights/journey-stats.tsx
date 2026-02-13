import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useRouter } from 'expo-router';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock traveler data - replace with real data
const TRAVELER = {
    name: 'Rahman',
    avatar: 'https://i.pravatar.cc/150?img=12',
    journeyStart: '2024-01-15',
    journeyEnd: '2024-06-30',
};

const STATS_CATEGORIES = [
    { id: 'checkpoints', label: 'Route Points', icon: 'map-marker-check', color: '#22c55e', value: '24' },
    { id: 'expenses', label: 'Expenses', icon: 'cash-multiple', color: '#f59e0b', value: '$2,450' },
    { id: 'stories', label: 'Stories', icon: 'book-open-page-variant', color: '#3b82f6', value: '12' },
    { id: 'spothunts', label: 'Spot Hunts', icon: 'magnify', color: '#ec4899', value: '8' },
    { id: 'meetups', label: 'Meetups', icon: 'account-group', color: '#14b8a6', value: '5' },
    { id: 'connectivity', label: 'Connectivity', icon: 'wifi', color: '#06b6d4', value: '18' },
    { id: 'photos', label: 'Photos', icon: 'camera', color: '#f97316', value: '47' },
];

// Mock route points data - replace with real data
const ROUTE_POINTS = [
    { id: 1, latitude: 37.7749, longitude: -122.4194, title: 'San Francisco' },
    { id: 2, latitude: 37.8044, longitude: -122.2712, title: 'Oakland' },
    { id: 3, latitude: 37.3382, longitude: -121.8863, title: 'San Jose' },
    { id: 4, latitude: 37.5485, longitude: -121.9886, title: 'Fremont' },
];

const InsightIndex = () => {
    const router = useRouter();

    const handleCategoryPress = (categoryId: string) => {
        // Navigate to specific insight category
        router.push(`/insights/${categoryId}`);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Stack.Screen 
                options={{ 
                    title: 'Journey Insights', 
                    headerTitleStyle: {
                        fontSize: 22,
                        fontFamily: 'Inter-Black',
                        color: '#1F3D2B',
                    },
                    headerBackButtonDisplayMode: 'minimal',
                }} 
            />

            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Map View */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 37.7749,
                            longitude: -122.4194,
                            latitudeDelta: 0.5,
                            longitudeDelta: 0.5,
                        }}
                    >
                        {/* Route Line */}
                        <Polyline
                            coordinates={ROUTE_POINTS.map(point => ({
                                latitude: point.latitude,
                                longitude: point.longitude,
                            }))}
                            strokeColor="#3b82f6"
                            strokeWidth={3}
                        />

                        {/* Checkpoint Markers */}
                        {ROUTE_POINTS.map((point, index) => (
                            <Marker
                                key={point.id}
                                coordinate={{
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                }}
                                title={point.title}
                            >
                                <View style={styles.markerContainer}>
                                    <View style={[
                                        styles.marker,
                                        index === 0 && styles.markerStart,
                                        index === ROUTE_POINTS.length - 1 && styles.markerEnd,
                                    ]}>
                                        <Text style={styles.markerText}>{index + 1}</Text>
                                    </View>
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Map Overlay Info */}
                    <View style={styles.mapOverlay}>
                        <View style={styles.mapInfoCard}>
                            <MaterialCommunityIcons name="map-marker-path" size={20} color="#3b82f6" />
                            <Text style={styles.mapInfoText}>
                                {ROUTE_POINTS.length} checkpoints • 142.5 km
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Traveler Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Image 
                                source={{ uri: TRAVELER.avatar }}
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{TRAVELER.name}</Text>
                            <View style={styles.journeyDates}>
                                <MaterialCommunityIcons name="calendar-range" size={14} color="#6b7280" />
                                <Text style={styles.journeyDateText}>
                                    {new Date(TRAVELER.journeyStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>
                                <MaterialCommunityIcons name="arrow-right" size={14} color="#6b7280" />
                                <Text style={styles.journeyDateText}>
                                    {new Date(TRAVELER.journeyEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats Navigation Grid */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        {STATS_CATEGORIES.map((category) => (
                            <Pressable
                                key={category.id}
                                style={({ pressed }) => [
                                    styles.statCard,
                                    pressed && styles.statCardPressed,
                                ]}
                                onPress={() => handleCategoryPress(category.id)}
                            >
                                <View style={styles.statCardContent}>
                                    <View style={[styles.statIconContainer, { backgroundColor: category.color + '20' }]}>
                                        <MaterialCommunityIcons 
                                            name={category.icon as any} 
                                            size={24} 
                                            color={category.color} 
                                        />
                                    </View>
                                    <Text style={styles.statValue}>{category.value}</Text>
                                    <Text style={styles.statLabel}>{category.label}</Text>
                                </View>
                                <MaterialCommunityIcons 
                                    name="chevron-right" 
                                    size={20} 
                                    color="#9ca3af" 
                                    style={styles.statChevron}
                                />
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default InsightIndex;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    mapContainer: {
        height: 300,
        backgroundColor: '#e5e7eb',
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    markerStart: {
        backgroundColor: '#22c55e',
    },
    markerEnd: {
        backgroundColor: '#ef4444',
    },
    markerText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    mapOverlay: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
    },
    mapInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    mapInfoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    profileSection: {
        padding: 16,
        paddingBottom: 8,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
        marginRight: 12,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    profileInfo: {
        flex: 1,
        gap: 6,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Inter-Black',
        color: '#1F3D2B',
    },
    journeyDates: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    journeyDateText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    statsSection: {
        padding: 16,
        paddingTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Inter-Black',
        color: '#1F3D2B',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '48%',
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        position: 'relative',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    statCardPressed: {
        backgroundColor: '#f9fafb',
        borderColor: '#d1d5db',
    },
    statCardContent: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginTop: 2,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4b5563',
        textAlign: 'center',
        marginTop: 1,
    },
    statChevron: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
});