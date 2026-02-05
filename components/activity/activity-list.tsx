import Animated from "react-native-reanimated"
import ExpenseUpdate from "./expense-update"
import GuessPIN from "./guess-pin"
import Meetup from "./meetup"
import NetworkUpdate from "./network-update"

const ActivityList = () => {
    return (
        <>
            <Animated.ScrollView style={{ padding: 16 }}>
                <GuessPIN />
                <NetworkUpdate />
                <ExpenseUpdate />
                <Meetup />
            </Animated.ScrollView>
        </>
    )
}

export default ActivityList