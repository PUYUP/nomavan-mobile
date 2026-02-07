import { useGetItemsMutation } from "@/services/receipt-extractor";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { Block } from "@infinitered/react-native-mlkit-text-recognition";
import { recognizeText } from "@infinitered/react-native-mlkit-text-recognition";
import { useHeaderHeight } from "@react-navigation/elements";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from "react-hook-form";
import { Animated, Dimensions, Image, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, View, XStack, YStack } from "tamagui";

interface Expense {
    items: Item[]
}

interface Item {
    name: string
    price: number
    quantity: number
    subtotal: number
}

const ScanReceipt = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const totalSafeAreaHeight = insets.top + insets.bottom;
    const headerHeight = useHeaderHeight();
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const scanHeight = windowHeight - headerHeight - totalSafeAreaHeight;

    const { control, handleSubmit, setValue } = useForm<Expense>();
    const cameraRef = useRef<CameraView | null>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaPermission, setMediaPermission] = useState<ImagePicker.PermissionResponse | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [recognizedText, setRecognizedText] = useState('');
    const scanAnim = useRef(new Animated.Value(0)).current;
    const [ocrBlocks, setOCRBlocks] = useState<Block[] | null>(null);
    const [extractItems, result] = useGetItemsMutation({ 
        fixedCacheKey: 'receipt-process',
    });

    const onSubmit: SubmitHandler<Expense> = (data) => {
        console.log('Submit!');
        console.log(data);
    };

    useEffect(() => {
        requestCameraPermission();
        ImagePicker.requestMediaLibraryPermissionsAsync().then(setMediaPermission);
    }, [requestCameraPermission]);

    useEffect(() => {
        return () => {
            scanAnim.stopAnimation();
            setIsProcessing(false);
            setImageUri(null);
            setRecognizedText('');
            setOCRBlocks(null);
        };
    }, [scanAnim]);

    useEffect(() => {
        if (!isProcessing || !imageUri) {
            scanAnim.stopAnimation();
            scanAnim.setValue(0);
            return;
        }

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, {
                    toValue: 1,
                    duration: 1400,
                    useNativeDriver: true,
                }),
                Animated.timing(scanAnim, {
                    toValue: 0,
                    duration: 1400,
                    useNativeDriver: true,
                }),
            ])
        );

        loop.start();
        return () => loop.stop();
    }, [imageUri, isProcessing, scanAnim]);

    const extractText = async (uri: string) => {
        setIsProcessing(true);
        try {
            const result = await recognizeText(uri);
            const text = Array.isArray(result)
                ? result.map((block) => block.text).join('\n')
                : String(result.text ?? '');
            
            // send pure result.blocks to GPT-4 to get the items
            const { data: extractResult } = await extractItems({ blocks: result.blocks });
            console.log('extracted items', extractResult)
            if (extractResult) {
                setIsProcessing(false);
                router.back();
            }

            setRecognizedText(text.trim());
        } catch (error) {
            alert('Unable to read text from the image.');
        } finally {
            // moved to extractItems
            // setIsProcessing(false);
        }
    };

    const resetPreview = () => {
        setImageUri(null);
        setRecognizedText('');
        setIsProcessing(false);
    };

    const handleCapture = async () => {
        if (imageUri) {
            resetPreview();
            return;
        }
        if (!cameraRef.current) {
            return;
        }
        try {
            const photo = await cameraRef.current.takePictureAsync({ 
                quality: 0.8, 
                skipProcessing: true,
                base64: false,
                fastMode: false,
            });
            if (photo?.uri) {
                setImageUri(photo.uri);
                await extractText(photo.uri);
            }
        } catch (error) {
            alert('Unable to capture photo.');
        }
    };

    const handlePickImage = async () => {
        if (imageUri) {
            resetPreview();
        }
        const permission = mediaPermission ?? await ImagePicker.requestMediaLibraryPermissionsAsync();
        setMediaPermission(permission);
        if (!permission.granted) {
            alert('Media permission is required to pick a photo.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: false,
            allowsMultipleSelection: false,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setImageUri(result.assets[0].uri);
            await extractText(result.assets[0].uri);
        }
    };

    useEffect(() => {
        if (result.isSuccess) {
            
        }
    }, [result.isSuccess]);

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Stack.Screen 
                    options={{ 
                        headerShown: true,
                        title: 'Scan Receipt', 
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
                    <YStack paddingStart="$2" paddingEnd="$2" flex={1} gap="$3">
                        <Text opacity={0.7}>Capture a receipt or select from gallery to extract items as a text.</Text>

                        <View style={[styles.previewCard, { height: scanHeight }]}>
                            {imageUri ? (
                                <View style={styles.previewInner}>
                                    <Image source={{ uri: imageUri }} style={[styles.previewImage, { height: scanHeight }]} />
                                    {isProcessing ? (
                                        <View style={styles.scanOverlay} pointerEvents="none">
                                            <Animated.View
                                                style={[
                                                    styles.scanLine,
                                                    {
                                                        transform: [
                                                            {
                                                                translateY: scanAnim.interpolate({
                                                                    inputRange: [0, 1],
                                                                    outputRange: [0, scanHeight - SCAN_LINE_HEIGHT],
                                                                }),
                                                            },
                                                        ],
                                                    },
                                                ]}
                                            />
                                        </View>
                                    ) : null}
                                </View>
                            ) : cameraPermission?.granted ? (
                                <CameraView
                                    ref={(ref) => { cameraRef.current = ref; }}
                                    style={styles.camera}
                                    facing="back"
                                />
                            ) : (
                                <View style={styles.permissionState}>
                                    <Text opacity={0.7}>Camera permission required.</Text>
                                    <Button onPress={requestCameraPermission}>Allow Camera</Button>
                                </View>
                            )}
                        </View>

                        {imageUri ? (
                            <Text opacity={0.6} fontSize={12}>
                                To change the image, capture or select from gallery again.
                            </Text>
                        ) : null}

                        {/* <YStack style={styles.textCard} gap="$2">
                            <XStack style={{ alignItems: 'center', gap: 8 }}>
                                <Text fontSize={14} fontWeight="700">Extracted Text</Text>
                                {isProcessing ? <ActivityIndicator size="small" /> : null}
                            </XStack>
                            <Text opacity={0.7} fontSize={12}>
                                {recognizedText || 'No text extracted yet.'}
                            </Text>
                        </YStack> */}
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 20, paddingBlockEnd: 6 }}>
                    <XStack gap="$4">
                        <Button onPress={handleCapture} flex={1} icon={<MaterialCommunityIcons name="camera-plus" size={20} />}>
                            <Text>Capture</Text>
                        </Button>
                        <Button onPress={handlePickImage} flex={1} icon={<MaterialCommunityIcons name="file-image-plus" size={20} />}>
                            <Text>Gallery</Text>
                        </Button>
                    </XStack>
                </View>
            </SafeAreaView>
        </>
    )
}

export default ScanReceipt;

const SCAN_HEIGHT = 320;
const SCAN_LINE_HEIGHT = 2;

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
    previewCard: {
        height: SCAN_HEIGHT,
        overflow: 'hidden',
        borderWidth: 0,
    },
    previewInner: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    camera: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    scanOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    scanLine: {
        height: SCAN_LINE_HEIGHT,
        backgroundColor: '#22c55e',
        shadowColor: '#22c55e',
        shadowOpacity: 0.8,
        shadowRadius: 6,
    },
    permissionState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    textCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f8fafc',
        padding: 12,
    },
    submitButton: {
        backgroundColor: '#00bcd4',
        color: '#fff',
        marginTop: 'auto',
    },
})