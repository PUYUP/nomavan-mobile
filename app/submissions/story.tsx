import { StoryPayload, useCreateStoryMutation } from "@/services/story";
import { LocationSelection, subscribeLocationSelected } from "@/utils/location-selector";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, TextArea, View, XStack, YStack } from "tamagui";

export interface Story {
    content: string;
    placeName: string;
    latitude: number;
    longitude: number;
}

const StorySubmission = () => {
    const router = useRouter();
    const [shareStory, { isLoading }] = useCreateStoryMutation({ fixedCacheKey: 'share-story-process' });
    const { control, handleSubmit, setValue, reset } = useForm<Story>();
    const [placeName, setPlaceName] = useState<string | undefined>('');
    const [location, setLocation] = useState<LocationSelection | null>();
    
    const onSubmit: SubmitHandler<Story> = async (data) => {
        const trimmedContent = data.content.trim();
        const titleMax = 60;
        const rawTitle = trimmedContent.slice(0, titleMax);
        const title = trimmedContent.length > titleMax
            ? `${rawTitle.slice(0, Math.max(0, titleMax - 1))}…`
            : rawTitle;
        const payload: StoryPayload = {
            title,
            content: data.content,
            status: 'publish',
            meta: {
                place_name: placeName,
                latitude: location?.latitude,
                longitude: location?.longitude,
            }
        }

        const result = await shareStory(payload);
        if (result && result.data) {
            router.back();
            reset();
            setPlaceName('');
            setLocation(null);
        }
    };

    useEffect(() => {
        const unsubscribeLocation = subscribeLocationSelected((selection) => {
            if (selection && selection.purpose === 'story') {
                setLocation(selection);
                setPlaceName(selection.placeName);

                setValue('placeName', selection?.placeName ? location?.placeName as string : '');
                setValue('latitude', location?.latitude ? location.latitude : 0);
                setValue('longitude', location?.longitude ? location.longitude : 0);
            }
        }, { emitLast: false });

        return () => {
            unsubscribeLocation();
        };
    }, []);

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
                        
                        {/* <YGroup>
                            <YGroup.Item>
                                <ListItem 
                                    rounded={8} 
                                    title="Image/video" 
                                    icon={<MaterialCommunityIcons name="folder-multiple-image" size={20} />} 
                                    onPress={() => {alert('Coming soon')}}
                                />
                            </YGroup.Item>
                        </YGroup> */}
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 16, paddingBlockEnd: 6 }}>
                    <XStack marginBlockEnd="$5" gap="$4" style={{ justifyContent: 'space-between' }}>
                        <XStack maxW={'60%'} gap="$3">
                            <MaterialCommunityIcons name="map-marker-radius-outline" size={24} />

                            <Text fontSize={placeName ? '$2' : '$3'} opacity={0.75}>
                                {placeName ? placeName : 'Not set yet'}
                            </Text>
                        </XStack>

                        <Button size={'$2'} width={74} onPress={() => router.push({
                            pathname: '/modals/map',
                            params: {
                                purpose: 'story',
                                placeName: location?.placeName,
                                initialLat: location?.latitude,
                                initialLng: location?.longitude,
                            }
                        })}>
                            <Text>{placeName ? 'Change' : 'Locate'}</Text>
                        </Button>
                    </XStack>

                    <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton} disabled={isLoading ? true : false }>
                        {isLoading ? <ActivityIndicator color={'#fff'} /> : null}
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