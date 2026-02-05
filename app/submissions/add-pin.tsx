import { useToastController } from '@tamagui/toast';
import { Stack } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, View, YStack } from "tamagui";

export interface PIN {
    note: string;
    lat: number;
	lng: number;
}

const AddPinSubmission = () => {
    const toast = useToastController()
    const { control, handleSubmit, setValue } = useForm<PIN>();
    const onSubmit: SubmitHandler<PIN> = (data) => {
        console.log('Submit!');
        console.log(data);
    };

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Stack.Screen 
                    options={{ 
                        title: 'Geo Guessr PIN', 
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
                        {/* map place here */}
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                    <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton}>
                        <Text color={'white'} fontSize={20}>Set PIN</Text>
                    </Button>
                </View>
            </SafeAreaView>
        </>
    )
}

export default AddPinSubmission;

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