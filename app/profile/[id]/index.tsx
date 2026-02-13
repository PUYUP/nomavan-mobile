import ActivityList from "@/components/activity-list";
import { useLocalSearchParams } from "expo-router";

const ProfileIndex = () => {
    const { id, isMe } = useLocalSearchParams();
    if (!id) return null;

    return (
        <ActivityList userId={Number(id)} />
    )
}

export default ProfileIndex;