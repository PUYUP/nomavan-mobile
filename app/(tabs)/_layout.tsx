import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Avatar, Text, XStack } from 'tamagui';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
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
        name="_placeholder-add"
        options={{
          tabBarButton: () => {
            return (
              <Pressable onPress={() => {alert('add')}} style={{ alignItems: 'center', justifyContent: 'center', marginTop: -8 }}>
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
        name="geo-guessr"
        options={{
          href: null,
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
        name="explore"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="account-hard-hat" color={color} />,
          href: null,
        }}
      />
    </Tabs>
  );
}
