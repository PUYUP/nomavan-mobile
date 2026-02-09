import { MeetupPayload, useCreateMeetupMutation } from "@/services/meetup";
import { subscribeDateTimeSelected } from "@/utils/datetime-selector";
import { LocationSelection, subscribeLocationSelected } from '@/utils/location-selector';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { format } from 'date-fns';
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Button, Input, Text, TextArea, View, XStack, YStack } from "tamagui";

export interface Meetup {
    name: string
    description: string
    startAt: string
    endAt: string
    lat: number
    lng: number
    address: string
    capacity: number
    coverageRadius: number
}

const CreateMeetupSubmission = () => {
    const router = useRouter();
    const { control, handleSubmit, setValue, reset } = useForm<Meetup>({
        defaultValues: {
            capacity: 10,
            coverageRadius: 1000,
        }
    });
    const [address, setAddress] = useState<string | undefined>('');
    const [location, setLocation] = useState<LocationSelection | undefined>();
    const [startAt, setStartAt] = useState<string>('');
    const [endAt, setEndAt] = useState<string>('');
    const [createMeetup, { isLoading }] = useCreateMeetupMutation({ fixedCacheKey: 'create-meetup-process' });
    const onSubmit: SubmitHandler<Meetup> = async (data) => {
        const payload: MeetupPayload = {
            name: data.name,
            description: data.description,
            start_at: startAt,
            end_at: endAt,
            latitude: data.lat,
            longitude: data.lng,
            address: data.address,
            capacity: data.capacity,
            coverage_radius: data.coverageRadius,
            types: 'meetup',
            status: 'public',
            invite_status: 'members',
        }
        const result = await createMeetup(payload);
   
        if (result && result.data) {
            Toast.show({
               type: 'success',
               text1: 'Meetup created' ,
               text2: 'Nearby vanlifers can now join you'
            });

            // reset form
            reset();
            setAddress('');
            setLocation(undefined);
            setStartAt('');
            setEndAt('');

            // back to prev page
            router.back();
        }
    };

    useEffect(() => {
        const unsubscribeLocation = subscribeLocationSelected((selection) => {
            if (selection && selection.purpose === 'meetup') {
                setLocation(selection);
                setAddress(selection.address);

                setValue('address', selection.address as string);
                setValue('lat', selection.latitude);
                setValue('lng', selection.longitude);
            }
        }, { emitLast: false });

        const unsubscribeDatetime = subscribeDateTimeSelected((selection) => {
            if (selection) {
                if (selection.purpose === 'end') {
                    setEndAt(selection.iso);
                } else if (selection.purpose === 'start') {
                    setStartAt(selection.iso);
                }
            }
        }, { emitLast: false });

        return () => {
            unsubscribeLocation();
            unsubscribeDatetime();
        };
    }, []);

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
                                    <Input 
                                        onChange={onChange} 
                                        placeholder="Meetup name…" 
                                        borderWidth={1} 
                                        value={value} 
                                        width={'100%'} 
                                        autoCapitalize="none"
                                        autoComplete="off"
                                        spellCheck={false}
                                        autoCorrect={false}
                                    />
                                )}
                            />
                        </XStack>

                        <XStack flex={1}>
                            <Controller
                                control={control}
                                name={'description'}
                                rules={{ required: true }}
                                render={({ field: { onChange, value } }) => (
                                    <TextArea 
                                        onChange={onChange} 
                                        rows={4} 
                                        placeholder="Description" 
                                        borderWidth={1} 
                                        value={value} 
                                        width={'100%'} 
                                        autoCapitalize="none"
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                )}
                            />
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="calendar-cursor-outline" size={28} />
                                <Text>Start</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Text>{startAt ? format(startAt, 'EEE, dd MMM yyyy HH:mm') : 'Not selected yet'}</Text>
                                <Button width={64} size="$2" onPress={() => router.push({
                                    pathname: '/modals/datetime',
                                    params: { purpose: 'start', initialISO: startAt }
                                })}>{startAt ? 'Change' : 'Select'}</Button>
                            </XStack>
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="calendar-check-outline" size={28} />
                                <Text>End</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Text>{endAt ? format(endAt, 'EEE, dd MMM yyyy HH:mm') : 'Not selected yet'}</Text>
                                <Button width={64} size="$2" onPress={() => router.push({
                                    pathname: '/modals/datetime',
                                    params: { purpose: 'end', initialISO: endAt }
                                })}>{endAt ? 'Change' : 'Select'}</Button>
                            </XStack>
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }} maxW={'70%'}>
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={28} />
                                <Text>{address ? address : 'Not selected yet'}</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Button width={64} size="$2" onPress={() => router.push({
                                    pathname: '/modals/map',
                                    params: {
                                        purpose: 'meetup',
                                        address: location?.address,
                                        initialLat: location?.latitude,
                                        initialLng: location?.longitude,
                                    }
                                })}>
                                    {address ? 'Change' : 'Select'}
                                </Button>
                            </XStack>
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="nature-people-outline" size={28} />
                                <Text>Max. guest</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Controller
                                    control={control}
                                    name={'capacity'}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                        <Input 
                                            onChange={onChange} 
                                            fontSize={12}
                                            value={String(value)} 
                                            padding={0}
                                            height={30}
                                            width={64} 
                                            textAlign="center" 
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            spellCheck={false}
                                            autoCorrect={false}
                                        />
                                    )}
                                />
                            </XStack>
                        </XStack>

                        <XStack gap="$4" style={{ justifyContent: 'space-between' }}>
                            <XStack gap="$3" style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="radius-outline" size={28} />
                                <Text>Radius coverage (in meters)</Text>
                            </XStack>

                            <XStack style={{ alignItems: 'center'}} gap="$3">
                                <Controller
                                    control={control}
                                    name={'coverageRadius'}
                                    rules={{ required: true }}
                                    render={({ field: { onChange, value } }) => (
                                        <Input 
                                            onChange={onChange} 
                                            fontSize={12}
                                            value={String(value)}
                                            padding={0}
                                            height={30} 
                                            width={64} 
                                            textAlign="center" 
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            spellCheck={false}
                                            autoCorrect={false}
                                        />
                                    )}
                                />
                            </XStack>
                        </XStack>
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                    <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton} disabled={isLoading ? true : false}>
                        {isLoading ? <ActivityIndicator color={'white'} /> : null}
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