import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import { Button } from "tamagui";

export default function StackLayout() {
    const router = useRouter();

    return (
        <Stack screenOptions={{ 
            headerShown: false,
            headerShadowVisible: false,
        }}>
            <Stack.Screen
                name="register"
                options={{
                    headerShown: true,
                    title: '',
                    headerLeft: () => {
                        return (
                            <Button 
                                circular 
                                onPress={() => router.push('/')} 
                                icon={<MaterialCommunityIcons name="close" size={28} />}
                            />
                        )
                    }
                }}
            />

            <Stack.Screen
                name="login"
                options={{
                    headerShown: true,
                    title: '',
                    headerLeft: () => {
                        return (
                            <Button 
                                circular 
                                onPress={() => router.push('/')} 
                                icon={<MaterialCommunityIcons name="close" size={28} />}
                            />
                        )
                    }
                }}
            />
        </Stack>
    );
}