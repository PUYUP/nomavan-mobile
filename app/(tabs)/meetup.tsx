import Meetup from '@/components/activity/meetup';
import Animated from 'react-native-reanimated';

export default function MeetupScreen() {
  const items = [
    {
      name: 'Desert Nomad Breakfast',
      dateRange: 'Feb 12, 2026 • 07:30 AM - 10:00 AM',
      locationName: 'Oak Creek Canyon',
      locationCoords: '34.9121, -111.7114',
      distance: 1400,
      description: 'Sunrise coffee, canyon views, and casual campfire stories.',
      joiners: [
        'https://i.pravatar.cc/100?img=31',
        'https://i.pravatar.cc/100?img=32',
        'https://i.pravatar.cc/100?img=33',
        'https://i.pravatar.cc/100?img=34',
        'https://i.pravatar.cc/100?img=35',
      ],
      extraJoinLabel: '+6',
      joinButtonLabel: 'Join',
      spotLeft: '2 spots left',
    },
    {
      name: 'Red Rocks Night Camp',
      dateRange: 'Feb 14, 2026 • 06:00 PM - 11:00 PM',
      locationName: 'Cathedral Rock',
      locationCoords: '34.8226, -111.7880',
      distance: 2400,
      description: 'Stargazing, lantern-lit hangs, and a shared potluck dinner.',
      joiners: [
        'https://i.pravatar.cc/100?img=41',
        'https://i.pravatar.cc/100?img=42',
        'https://i.pravatar.cc/100?img=43',
        'https://i.pravatar.cc/100?img=44',
        'https://i.pravatar.cc/100?img=45',
      ],
      extraJoinLabel: '+18',
      joinButtonLabel: 'Join',
      spotLeft: '43 spots left',
    },
    {
      name: 'Vanlife Gear Swap',
      dateRange: 'Feb 16, 2026 • 01:00 PM - 04:30 PM',
      locationName: 'Tlaquepaque Plaza',
      locationCoords: '34.8653, -111.7635',
      distance: 7631,
      description: 'Trade gear, share tips, and find your next road companion.',
      joiners: [
        'https://i.pravatar.cc/100?img=51',
        'https://i.pravatar.cc/100?img=52',
        'https://i.pravatar.cc/100?img=53',
        'https://i.pravatar.cc/100?img=54',
        'https://i.pravatar.cc/100?img=55',
      ],
      extraJoinLabel: '+9',
      joinButtonLabel: 'Join',
      spotLeft: '1 spots left',
    },
  ]

  return (
    <Animated.ScrollView style={{ padding: 16 }}>
      {items.map((event) => (
        <Meetup
          key={event.name}
          name={event.name}
          dateRange={event.dateRange}
          locationName={event.locationName}
          locationCoords={event.locationCoords}
          distance={event.distance}
          description={event.description}
          joiners={event.joiners}
          extraJoinLabel={event.extraJoinLabel}
          joinButtonLabel={event.joinButtonLabel}
          spotLeft={event.spotLeft}
        />
      ))}
    </Animated.ScrollView>
  );
}
