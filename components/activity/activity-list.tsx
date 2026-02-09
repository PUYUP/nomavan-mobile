import Animated from "react-native-reanimated"
import ConnectivityUpdate from "./connectivity-update"
import ExpenseUpdate from "./expense-update"
import GuessPIN from "./guess-pin"
import Meetup from "./meetup"
import StoryUpdate from "./story-update"

const ActivityList = () => {
    return (
        <>
            <Animated.ScrollView style={{ padding: 16 }}>
                <GuessPIN />
                <StoryUpdate />
                <ConnectivityUpdate />
                <ExpenseUpdate />
                <Meetup />
            </Animated.ScrollView>
        </>
    )
}

export default ActivityList