import ActivityList from '@/components/activity/activity-list';
import Animated from 'react-native-reanimated';

export default function FeedScreen() {
  return (
    <Animated.ScrollView>
      <ActivityList />
    </Animated.ScrollView>
  );
}
