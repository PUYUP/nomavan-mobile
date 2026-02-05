import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { BackHandler, Pressable, StyleSheet } from 'react-native';
import { Avatar, Sheet, Text, View, XStack, YStack } from 'tamagui';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onBackPress = () => {
      setOpen(false);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [open]);

  const quickActions = [
    { label: 'New Meetup', key: 'new-meetup', icon: 'account-group' as const },
    { label: 'Add PIN', key: 'add-pin', icon: 'map-marker-plus' as const },
    { label: 'Locate', key: 'locate', icon: 'map-marker-path' as const },
    { label: 'Expense', key: 'expense', icon: 'store-plus-outline' as const },
    { label: 'Signaling', key: 'signaling', icon: 'access-point-network' as const },
    { label: 'Post', key: 'post', icon: 'post' as const },
  ];

  type QuickAction = (typeof quickActions)[number];

  /**
   * Quick action button handler
   */
  const quickActionHandler = async (action: QuickAction) => {
    // close quick action sheet
    setOpen(false);

    switch (action.key) {
      case 'signaling':
        router.push('/submissions/signaling');
        break;

      case 'locate':
        router.push('/submissions/locate');
        break;

      default:
        // not implemented
    }
  }

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
            maxWidth: 280,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Nomavan',
            tabBarLabel: 'Feeds',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="timeline-text" color={color} />,
            headerRight: () => {
              return (
                <Pressable onPress={() => {}}>
                  <View
                    style={{
                      height: 36,
                      width: 36,
                      borderRadius: 18,
                      backgroundColor: 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <MaterialCommunityIcons name="filter-variant" size={24} />
                  </View>
                </Pressable>
              )
            },
            headerLeft: () => {
              return (
                <Avatar circular size="$2" style={{ marginHorizontal: 16 }}>
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
              <Pressable style={{ marginRight: 16 }} onPress={() => router.push('/submissions/locate')}>
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
          name="meetup"
          options={{
            title: 'Meetups',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="account-group" color={color} />,
            headerLeft: () => {
              return (
                <Pressable onPress={() => {}}>
                  <View
                    style={{
                      height: 36,
                      width: 36,
                      borderRadius: 18,
                      backgroundColor: 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 10,
                      marginRight: 16,
                    }}
                  >
                    <MaterialCommunityIcons name="filter-variant" size={24} />
                  </View>
                </Pressable>
              )
            },
            headerRight: () => (
              <Pressable onPress={() => {}}>
                <View
                  style={{
                    height: 30,
                    paddingHorizontal: 10,
                    borderRadius: 18,
                    backgroundColor: '#eef2ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <XStack style={{ alignItems: 'center', gap: 2 }}>
                    <Text fontSize={14}>Create</Text>
                    <MaterialCommunityIcons name="plus" size={22} />
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

      {/* Action sheet for create a feed (shortcut) */}
      <Sheet 
        open={open}
        modal={false}
        transition="medium"
        zIndex={100_000}
        onOpenChange={setOpen}
        snapPointsMode={'constant'}
        snapPoints={[272, 272]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          bg="$shadow6"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame justify="flex-start" items="flex-start">
          <XStack style={[styles.grid, {padding: 16}]}>
            {quickActions.map((action) => (
              <Pressable key={action.label} style={styles.gridButton} onPress={() => quickActionHandler(action)}>
                <YStack style={styles.gridButtonContent}>
                  <MaterialCommunityIcons name={action.icon} size={28} color="#1F3D2B" />
                  <Text style={styles.gridButtonText}>{action.label}</Text>
                </YStack>
              </Pressable>
            ))}
          </XStack>
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
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridButtonContent: {
    alignItems: 'center',
    gap: 9,
  },
  gridButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F3D2B',
    textAlign: 'center',
  },
});