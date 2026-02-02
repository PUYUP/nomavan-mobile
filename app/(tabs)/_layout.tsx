import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { Avatar, Button, Sheet, Text, View, XStack, YStack } from 'tamagui';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [open, setOpen] = React.useState(false);

  const quickActions = [
    { label: 'Add Event', icon: 'calendar-plus' as const },
    { label: 'New PIN', icon: 'map-marker-plus' as const },
    { label: 'Locate', icon: 'map-marker-path' as const },
    { label: 'Expense', icon: 'store-plus-outline' as const },
    { label: 'Signaling', icon: 'access-point-network' as const },
    { label: 'Share', icon: 'share-variant' as const },
  ];

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          headerTransparent: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontSize: 22,
            fontFamily: 'Inter-Black',
            color: '#1F3D2B',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Nomavan',
            tabBarLabel: 'Feeds',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="timeline-text" color={color} />,
            headerLeft: () => {
              return (
                <MaterialCommunityIcons name='van-utility' size={36} style={{ marginLeft: 16, marginRight: 8 }} color={'#1F3D2B'} />
              )
            },
            headerRight: () => {
              return (
                <Avatar circular size="$2" style={{ marginRight: 16 }}>
                  <Avatar.Image
                    src="https://i.pravatar.cc/100?img=17"
                    accessibilityLabel="Contributor avatar"
                  />
                  <Avatar.Fallback />
                </Avatar>
              )
            }
          }}
        />
        <Tabs.Screen
          name="geo-guessr"
          options={{
            title: 'Geo Guessr',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="map-search" color={color} />,
            headerTitleAlign: 'left',
            headerRight: () => (
              <Pressable style={{ marginRight: 16 }} onPress={() => {}}>
                <View
                  style={{
                    height: 30,
                    paddingHorizontal: 10,
                    borderRadius: 18,
                    backgroundColor: '#eef2ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XStack style={{ alignItems: 'center', gap: 6 }}>
                    <Text fontSize={14}>Add PIN</Text>
                    <MaterialCommunityIcons name="map-marker-plus" size={22} />
                  </XStack>
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="_placeholder-add"
          options={{
            tabBarButton: () => {
              return (
                <Pressable onPress={() => {setOpen(true)}} style={{ alignItems: 'center', justifyContent: 'center', marginTop: -8 }}>
                  <View
                    style={{
                      height: 56,
                      width: 56,
                      borderRadius: 28,
                      backgroundColor: '#1F3D2B',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={28} color="#fff" />
                  </View>
                </Pressable>
              )
            }
          }}
        />
        <Tabs.Screen
          name="en-route"
          options={{
            title: 'En Route',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="highway" color={color} />,
            headerTitleAlign: 'left',
            headerRight: () => (
              <Pressable style={{ marginRight: 16 }} onPress={() => {}}>
                <View
                  style={{
                    height: 30,
                    paddingHorizontal: 10,
                    borderRadius: 18,
                    backgroundColor: '#eef2ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XStack style={{ alignItems: 'center', gap: 6 }}>
                    <Text fontSize={14}>Locate</Text>
                    <MaterialCommunityIcons name="map-marker-path" size={22} />
                  </XStack>
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="_placeholder-more"
          options={{
            title: 'More',
            href: null,
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="menu" color={color} />,
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent the default navigation action
              e.preventDefault(); 

              // If not, show an alert or navigate elsewhere (e.g., login screen)
              alert("Please log in first!");
            },
          })}
        />
        <Tabs.Screen
          name="event"
          options={{
            title: 'Events',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="party-popper" color={color} />,
            headerTitleAlign: 'left',
            headerRight: () => (
              <XStack style={{ alignItems: 'center', paddingRight: 12, gap: 8 }}>
                <Pressable onPress={() => {}}>
                  <View
                    style={{
                      height: 30,
                      paddingHorizontal: 10,
                      borderRadius: 18,
                      backgroundColor: '#eef2ff',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <XStack style={{ alignItems: 'center', gap: 6 }}>
                      <Text fontSize={14}>Add New</Text>
                      <MaterialCommunityIcons name="calendar-plus" size={22} />
                    </XStack>
                  </View>
                </Pressable>

                <Pressable onPress={() => {}}>
                  <View
                    style={{
                      height: 36,
                      width: 36,
                      borderRadius: 18,
                      backgroundColor: 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="calendar-filter" size={24} />
                  </View>
                </Pressable>
              </XStack>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Jobs',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="account-hard-hat" color={color} />,
            href: null,
          }}
        />
      </Tabs>

      {/* Action sheet for create a feed (shortcut) */}
      <Sheet 
        open={open}
        modal={false}
        transition="medium"
        zIndex={100_000}
        onOpenChange={setOpen}
        snapPointsMode={'constant'}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          bg="$shadow6"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame p="$4" justify="center" items="center">
          <SafeAreaView style={styles.safeArea}>
            <XStack style={[styles.grid, {paddingTop: 16}]}>
              {quickActions.map((action) => (
                <Button key={action.label} style={styles.gridButton}>
                  <YStack style={styles.gridButtonContent}>
                    <MaterialCommunityIcons name={action.icon} size={28} color="#1F3D2B" />
                    <Text style={styles.gridButtonText}>{action.label}</Text>
                  </YStack>
                </Button>
              ))}
            </XStack>
          </SafeAreaView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  safeArea: {
    width: '100%',
  },
  gridButton: {
    width: '31%',
    height: 90,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridButtonContent: {
    alignItems: 'center',
    gap: 8,
  },
  gridButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F3D2B',
    textAlign: 'center',
  },
});