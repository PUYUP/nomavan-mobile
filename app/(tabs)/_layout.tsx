import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAuth } from '@/services/auth-storage';
import { subscribeActivityFilter } from '@/utils/activity-filter';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { BackHandler, Platform, Pressable, StyleSheet } from 'react-native';
import { Avatar, Button, Sheet, Text, View, XStack, YStack } from 'tamagui';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string>('all');

  // Subscribe to activity filter changes
  React.useEffect(() => {
    const unsubscribe = subscribeActivityFilter((filterType) => {
      setActiveFilter(filterType);
    }, { emitLast: true });

    return () => unsubscribe();
  }, []);

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
    { label: 'Meetup', key: 'meetup', icon: 'account-group' as const },
    { label: 'Spot', key: 'add-pin', icon: 'map-marker-plus' as const },
    { label: 'Locate', key: 'locate', icon: 'map-marker-path' as const },
    { label: 'Expense', key: 'expense', icon: 'basket-plus-outline' as const },
    { label: 'Signal', key: 'connectivity', icon: 'access-point-network' as const },
    { label: 'Story', key: 'story', icon: 'post' as const },
  ];

  type QuickAction = (typeof quickActions)[number];

  // Map filter types to activity types and titles
  const getMapViewParams = (filterType: string) => {
    const filterMap: Record<string, { type: string[], title: string }> = {
      all: { type: [], title: 'Activities Map' },
      expenses: { type: ['new_expense'], title: 'Expenses Map' },
      routes: { type: ['new_route_point'], title: 'Routes Map' },
      connections: { type: ['new_connectivity'], title: 'Signal Map' },
      meetups: { type: ['created_group'], title: 'Meetups Map' },
      stories: { type: ['new_story'], title: 'Stories Map' },
      spothunts: { type: ['new_spothunt'], title: 'Spot Hunts Map' },
    };

    return filterMap[filterType] || filterMap.all;
  };

  /**
   * Quick action button handler
   */
  const quickActionHandler = async (action: QuickAction) => {
    // close quick action sheet
    setOpen(false);

    const auth = await getAuth();
    if (!auth) {
      alert('Please log in to perform this action.');
      return;
    }

    const userId = auth.user?.id;

    switch (action.key) {
      case 'connectivity':
        router.push({
          pathname: '/submissions/connectivity',
          params: {
            userId: userId?.toString() || '0',
          }
        });
        break;

      case 'locate':
        router.push({
          pathname: '/submissions/locate',
          params: {
            userId: userId?.toString() || '0',
          }
        });
        break;
      
      case 'story':
        router.push({
          pathname: '/submissions/story',
          params: {
            userId: userId?.toString() || '0',
          }
        });
        break;
      
      case 'add-pin':
        router.push('/submissions/add-pin');
        break;
      
      case 'expense':
        router.push('/submissions/expenses/submit');
        break;
      
      case 'meetup':
        router.push('/submissions/create-meetup');
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
            height: Platform.OS == 'ios' ? 110 : 80,
          },
          headerTitleStyle: {
            fontSize: 22,
            fontFamily: 'Inter-Black',
            color: '#1F3D2B',
          },
        }}>
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Nomavan',
            tabBarLabel: 'Feeds',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="timeline-text" color={color} />,
            headerRight: () => {
              const mapParams = getMapViewParams(activeFilter);
              
              return (
                <XStack gap="$2" marginInlineEnd={16} style={{ alignItems: 'center' }}>
                  <Button
                    circular
                    size="$3"
                    onPress={() => router.push({
                      pathname: '/searchs/members',
                      params: {
                        // component: 'activity',
                        type: mapParams.type,
                        title: mapParams.title,
                      }
                    })}
                  >
                    <MaterialCommunityIcons name="account-search" size={22} />
                  </Button>

                  <Button
                    circular
                    size="$3"
                    onPress={() => router.push({
                      pathname: '/feeds/map-view',
                      params: {
                        // component: 'activity',
                        type: mapParams.type,
                        title: mapParams.title,
                      }
                    })}
                  >
                    <MaterialCommunityIcons name="land-plots-marker" size={22} />
                  </Button>
                </XStack>
              )
            },
            headerLeft: async () => {
              const auth = await getAuth();
              
              return (
                <Pressable onPress={() => router.push({
                  pathname: '/profile/[id]',
                  params: { 
                    id: auth ? auth.user?.id : '0',
                    isMe: 'true',
                  }
                })}>
                  <Avatar circular size="$2.5" style={{ marginHorizontal: 16 }}>
                    <Avatar.Image
                      src={auth ? 'https:' + auth.user?.avatar?.thumb : "https://i.pravatar.cc/100?img=17"}
                      accessibilityLabel="Contributor avatar"
                    />
                    <Avatar.Fallback />
                  </Avatar>
                </Pressable>
              )
            }
          }}
        />
        <Tabs.Screen
          name="spothunt"
          options={{
            title: 'Spot Hunt',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="map-search" color={color} />,
            headerTitleAlign: 'left',
            headerRight: () => (
              <Pressable style={{ marginRight: 16 }} onPress={() => {router.push('/submissions/add-pin')}}>
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
                    <Text fontSize={14}>Add Pin</Text>
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
              <Pressable 
                style={{ marginRight: 16 }} 
                onPress={async () => {
                  const auth = await getAuth();
                  router.push({
                    pathname: '/submissions/locate',
                    params: {
                      userId: auth ? auth.user?.id?.toString() : '0',
                    }
                  });
                }}
              >
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
                <XStack marginInlineStart={16} marginInlineEnd={Platform.OS == 'android' ? 10 : 0}>
                  <Pressable onPress={() => {}}>
                    <Button
                      circular
                      size="$3"
                      style={{
                        
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialCommunityIcons name="filter-cog-outline" size={22} />
                    </Button>
                  </Pressable>
                </XStack>
              )
            },
            headerRight: () => (
              <Pressable onPress={() => router.push('/submissions/create-meetup')}>
                <View
                  style={{
                    height: 30,
                    paddingHorizontal: 10,
                    borderRadius: 18,
                    backgroundColor: '#eef2ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
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
              <Pressable key={action.label} style={styles.gridButton} onPress={async () => await quickActionHandler(action)}>
                <YStack style={styles.gridButtonContent}>
                  <MaterialCommunityIcons name={action.icon} size={28} color="#1F3D2B" />
                  <Text style={styles.gridButtonText} numberOfLines={1}>{action.label}</Text>
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
    paddingHorizontal: 4,
  },
  gridButtonContent: {
    alignItems: 'center',
    gap: 9,
    width: '100%',
  },
  gridButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F3D2B',
    textAlign: 'center',
    width: '100%',
  },
});