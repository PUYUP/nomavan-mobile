import Animated from "react-native-reanimated"
import Event from "./event"
import ExpenseUpdate from "./expense-update"
import GuessPIN from "./guess-pin"
import NetworkUpdate from "./network-update"

const ActivityList = () => {
    return (
        <>
            <Animated.ScrollView style={{ padding: 16 }}>
                <GuessPIN />
                <NetworkUpdate />
                <ExpenseUpdate />
                <Event />
            </Animated.ScrollView>
        </>
    )
}

export default ActivityList