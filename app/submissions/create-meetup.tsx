import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack } from "expo-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Text, TextArea, View, XStack, YStack } from "tamagui";

export interface Meetup {
    name: string
    description: string
    startDate: string
    endDate: string
    timezone: string
    lat: number
    lng: number
    address: string
    capacity: number
    coverageRadius: number
}

const CreateMeetupSubmission = () => {
    const { control, handleSubmit, setValue } = useForm<Meetup>();
    const onSubmit: SubmitHandler<Meetup> = (data) => {
        console.log('Submit!');
        console.log(data);
    };

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Stack.Screen 
                    options={{ 
                        title: 'Create a Meetup', 
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
                    <YStack gap="$4">
                        <XStack flex={1}>
                            <Controller
                                control={control}
                                name={'name'}
                                rules={{ required: true }}
                                render={({ field: { onChange, value } }) => (
                                    <Input onChange={onChange} size="$3" placeholder="Meetup name…" borderWidth={1} value={value} width={'100%'} />
                                )}
                            />
                        </XStack>

                        <XStack flex={1}>
                            <Controller
                                control={control}
                                name={'description'}
                                rules={{ required: true }}
                                render={({ field: { onChange, value } }) => (
                                    <TextArea onChange={onChange} size="$3" rows={4} placeholder="Description" borderWidth={1} value={value} width={'100%'} />
                                )}
                            />
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="calendar-cursor-outline" size={28} />
                                <Text>Start</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Text>Sat, Des 25, 25 17:00</Text>
                                <Button size="$2">Change</Button>
                            </XStack>
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="calendar-check-outline" size={28} />
                                <Text>End</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Text>Sat, Jan 3, 25 17:00</Text>
                                <Button size="$2">Change</Button>
                            </XStack>
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }} maxW={'70%'}>
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={28} />
                                <Text>Paal Merah, Kec. Jambi Sel., Kota Jambi, Jambi 36128</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Button size="$2">Change</Button>
                            </XStack>
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="nature-people-outline" size={28} />
                                <Text>Max. guest</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Input size="$2" width={80} textAlign="center" value={'10'}></Input>
                            </XStack>
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="radius-outline" size={28} />
                                <Text>Radius coverage (in meters)</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Input size="$2" width={80} textAlign="center" value={'100'}></Input>
                            </XStack>
                        </XStack>
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                    <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton}>
                        <Text color={'white'} fontSize={20}>Save</Text>
                    </Button>
                </View>
            </SafeAreaView>
        </>
    )
}

export default CreateMeetupSubmission;

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