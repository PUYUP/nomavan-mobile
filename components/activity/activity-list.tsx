import Animated from "react-native-reanimated"
import ConnectivityUpdate from "./connectivity-update"
import ExpenseUpdate from "./expense-update"
import Meetup from "./meetup"
import SpotHuntPin from "./spothunt-pin"
import StoryUpdate from "./story-update"

const ActivityList = () => {
    return (
        <>
            <Animated.ScrollView style={{ padding: 16 }}>
                <SpotHuntPin />
                <StoryUpdate />
                <ConnectivityUpdate />
                <ExpenseUpdate />
                <Meetup />
            </Animated.ScrollView>
        </>
    )
}

export default ActivityList