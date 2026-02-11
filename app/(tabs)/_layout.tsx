import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAuth } from '@/services/auth-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Menu } from '@tamagui/menu';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { BackHandler, Platform, Pressable, StyleSheet } from 'react-native';
import { Avatar, Button, Sheet, Text, View, XStack, YStack } from 'tamagui';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState<string[]>([]);

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
    { label: 'New Meetup', key: 'meetup', icon: 'account-group' as const },
    { label: 'Add Spot', key: 'add-pin', icon: 'map-marker-plus' as const },
    { label: 'Locate', key: 'locate', icon: 'map-marker-path' as const },
    { label: 'Expense', key: 'expense', icon: 'basket-plus-outline' as const },
    { label: 'Connectivity', key: 'connectivity', icon: 'access-point-network' as const },
    { label: 'Story', key: 'story', icon: 'post' as const },
  ];

  type QuickAction = (typeof quickActions)[number];

  /**
   * Quick action button handler
   */
  const quickActionHandler = async (action: QuickAction) => {
    // close quick action sheet
    setOpen(false);

    switch (action.key) {
      case 'connectivity':
        router.push('/submissions/connectivity');
        break;

      case 'locate':
        router.push('/submissions/locate');
        break;
      
      case 'story':
        router.push('/submissions/story');
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
              return (
                <XStack gap="$2" marginInlineEnd={16} style={{ alignItems: 'center' }}>
                  <Button
                    circular
                    size="$3"
                    onPress={() => router.push({
                      pathname: '/feed/map-view',
                      params: {
                        component: 'activity',
                        type: ['new_connectivity'],
                        title: 'Connectivities Map',
                      }
                    })}
                  >
                    <MaterialCommunityIcons name="map-search" size={22} />
                  </Button>

                  <Menu closeOnSelect={false}>
                    <Menu.Trigger asChild>
                      <Button
                        circular
                        size="$3"
                      >
                        <MaterialCommunityIcons name="filter-cog-outline" size={22} />
                      </Button>
                    </Menu.Trigger>

                    <Menu.Content
                      loop
                      sideOffset={5}
                      alignOffset={-5}
                      minWidth={200}
                    >
                      <Menu.Label>Filter Activity Type</Menu.Label>
                      <Menu.Separator />
                      
                      <Menu.CheckboxItem
                        value="new_expense"
                        checked={selectedFilter.includes('new_expense')}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedFilter(prev => 
                            checked ? [...prev, 'new_expense'] : prev.filter(f => f !== 'new_expense')
                          );
                        }}
                      >
                        <Menu.ItemIndicator>
                          <MaterialCommunityIcons name="check" size={16} />
                        </Menu.ItemIndicator>
                        <Menu.ItemTitle>Expense</Menu.ItemTitle>
                      </Menu.CheckboxItem>

                      <Menu.CheckboxItem
                        value="new_connectivity"
                        checked={selectedFilter.includes('new_connectivity')}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedFilter(prev => 
                            checked ? [...prev, 'new_connectivity'] : prev.filter(f => f !== 'new_connectivity')
                          );
                        }}
                      >
                        <Menu.ItemIndicator>
                          <MaterialCommunityIcons name="check" size={16} />
                        </Menu.ItemIndicator>
                        <Menu.ItemTitle>Connectivity</Menu.ItemTitle>
                      </Menu.CheckboxItem>

                      <Menu.CheckboxItem
                        value="new_spothunt"
                        checked={selectedFilter.includes('new_spothunt')}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedFilter(prev => 
                            checked ? [...prev, 'new_spothunt'] : prev.filter(f => f !== 'new_spothunt')
                          );
                        }}
                      >
                        <Menu.ItemIndicator>
                          <MaterialCommunityIcons name="check" size={16} />
                        </Menu.ItemIndicator>
                        <Menu.ItemTitle>Spot Hunt</Menu.ItemTitle>
                      </Menu.CheckboxItem>

                      <Menu.CheckboxItem
                        value="new_route_point"
                        checked={selectedFilter.includes('new_route_point')}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedFilter(prev => 
                            checked ? [...prev, 'new_route_point'] : prev.filter(f => f !== 'new_route_point')
                          );
                        }}
                      >
                        <Menu.ItemIndicator>
                          <MaterialCommunityIcons name="check" size={16} />
                        </Menu.ItemIndicator>
                        <Menu.ItemTitle>Route Point</Menu.ItemTitle>
                      </Menu.CheckboxItem>

                      <Menu.CheckboxItem
                        value="created_group"
                        checked={selectedFilter.includes('created_group')}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedFilter(prev => 
                            checked ? [...prev, 'created_group'] : prev.filter(f => f !== 'created_group')
                          );
                        }}
                      >
                        <Menu.ItemIndicator>
                          <MaterialCommunityIcons name="check" size={16} />
                        </Menu.ItemIndicator>
                        <Menu.ItemTitle>Created Group</Menu.ItemTitle>
                      </Menu.CheckboxItem>

                      <Menu.CheckboxItem
                        value="new_story"
                        checked={selectedFilter.includes('new_story')}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedFilter(prev => 
                            checked ? [...prev, 'new_story'] : prev.filter(f => f !== 'new_story')
                          );
                        }}
                      >
                        <Menu.ItemIndicator>
                          <MaterialCommunityIcons name="check" size={16} />
                        </Menu.ItemIndicator>
                        <Menu.ItemTitle>Story</Menu.ItemTitle>
                      </Menu.CheckboxItem>

                      <Menu.Separator />
                      <Menu.Item onSelect={() => setSelectedFilter([])}>
                        <Menu.ItemTitle>Clear All</Menu.ItemTitle>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu>
                </XStack>
              )
            },
            headerLeft: async () => {
              const auth = await getAuth();
              
              return (
                <Pressable onPress={() => router.push('/')}>
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
                  <Text style={styles.gridButtonText} width={'100%'}>{action.label}</Text>
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