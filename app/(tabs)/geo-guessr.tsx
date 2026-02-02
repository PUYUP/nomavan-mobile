import GuessPIN from '@/components/activity/guess-pin';
import Animated from 'react-native-reanimated';

export default function TabTwoScreen() {
  const pins = [
    {
      title: 'GeoGuessr PIN Dropped',
      coordinates: '34.9121, -111.7114',
      timeAgo: '2 min ago',
      photos: [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=80',
      ],
      morePhotosLabel: '+7',
      placeLabel: 'Placed near Oak Creek',
      visitorsLabel: '10 were here',
      viewPinLabel: 'Find the PIN',
      contributorName: 'Samuel Rizal',
      contributorMeta: '1.276 contribs.',
      pinsAddedLabel: '36 PIN Added',
      contributorTimeAgo: '2 minutes ago',
    },
    {
      title: 'Canyon Ridge PIN Spotted',
      coordinates: '34.8653, -111.7635',
      timeAgo: '12 min ago',
      photos: [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&q=80',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=80',
      ],
      morePhotosLabel: '+3',
      placeLabel: 'Placed near Cathedral Rock',
      visitorsLabel: '18 were here',
      viewPinLabel: 'Find the PIN',
      contributorName: 'Ava Noura',
      contributorMeta: '842 contribs.',
      pinsAddedLabel: '19 PIN Added',
      contributorTimeAgo: '18 minutes ago',
    },
  ]

  return (
    <Animated.ScrollView style={{ padding: 16 }}>
      {pins.map((pin) => (
        <GuessPIN key={`${pin.coordinates}-${pin.title}`} {...pin} />
      ))}
    </Animated.ScrollView>
  );
}
