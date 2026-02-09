import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack } from "expo-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ListItem, Text, TextArea, View, YGroup, YStack } from "tamagui";

export interface Story {
    content: string;
}

const StorySubmission = () => {
    const { control, handleSubmit, setValue } = useForm<Story>();
    const onSubmit: SubmitHandler<Story> = (data) => {
        console.log('Submit!');
        console.log(data);
    };

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Stack.Screen 
                    options={{ 
                        title: 'Share Story', 
                        headerTitleStyle: {
                            fontSize: 22,
                            fontFamily: 'Inter-Black',
                            color: '#1F3D2B',
                        },
                        headerBackButtonDisplayMode: 'minimal' 
                    }} 
                />

                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContent}
                    enableOnAndroid
                    extraScrollHeight={24}
                    keyboardOpeningTime={0}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'never' : 'automatic'}
                >
                    <YStack paddingStart="$0" paddingEnd="$0" flex={1} gap="$2">
                        <Controller
                            control={control}
                            name={'content'}
                            rules={{ required: true }}
                            render={({ field: { onChange, value } }) => (
                                <TextArea onChange={onChange} size="$3" placeholder="Share something…" borderWidth={1} rows={6} value={value} />
                            )}
						/>
                        
                        <YGroup>
                            <YGroup.Item>
                                <ListItem 
                                    rounded={8} 
                                    title="Image/video" 
                                    icon={<MaterialCommunityIcons name="folder-multiple-image" size={20} />} 
                                    onPress={() => {alert('Coming soon')}}
                                />
                            </YGroup.Item>
                        </YGroup>
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                    <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton}>
                        <Text color={'white'} fontSize={20}>Post</Text>
                    </Button>
                </View>
            </SafeAreaView>
        </>
    )
}

export default StorySubmission;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    submitButton: {
		backgroundColor: '#00bcd4',
		color: '#fff',
		marginTop: 'auto',
	},
})