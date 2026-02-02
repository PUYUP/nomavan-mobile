import ArrivedOnSite from '@/components/activity/arrived-on-site';
import OnTheWay from '@/components/activity/on-the-way';
import Animated from 'react-native-reanimated';

export default function EnRouteScreen() {
  return (
    <Animated.ScrollView style={{ padding: 16 }}>
      <ArrivedOnSite />
      <OnTheWay />
      <OnTheWay />
    </Animated.ScrollView>
  );
}
