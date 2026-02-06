import { recognizeText } from "@infinitered/react-native-mlkit-text-recognition";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
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
    const { control, handleSubmit, setValue } = useForm<Expense>();
    const cameraRef = useRef<CameraView | null>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaPermission, setMediaPermission] = useState<ImagePicker.PermissionResponse | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [recognizedText, setRecognizedText] = useState('');
    const onSubmit: SubmitHandler<Expense> = (data) => {
        console.log('Submit!');
        console.log(data);
    };

    useEffect(() => {
        requestCameraPermission();
        ImagePicker.requestMediaLibraryPermissionsAsync().then(setMediaPermission);
    }, [requestCameraPermission]);

    const extractText = async (uri: string) => {
        setIsProcessing(true);
        try {
            const result = await recognizeText(uri);
            const text = Array.isArray(result)
                ? result.map((block) => block.text).join('\n')
                : String(result.text ?? '');
            
            setRecognizedText(text.trim());
        } catch (error) {
            alert('Unable to read text from the image.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCapture = async () => {
        if (!cameraRef.current) {
            return;
        }
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
            if (photo?.uri) {
                setImageUri(photo.uri);
                await extractText(photo.uri);
            }
        } catch (error) {
            alert('Unable to capture photo.');
        }
    };

    const handlePickImage = async () => {
        const permission = mediaPermission ?? await ImagePicker.requestMediaLibraryPermissionsAsync();
        setMediaPermission(permission);
        if (!permission.granted) {
            alert('Media permission is required to pick a photo.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setImageUri(result.assets[0].uri);
            await extractText(result.assets[0].uri);
        }
    };

    useEffect(() => {
        console.log(recognizedText);
    }, [recognizedText]);

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
                    <YStack paddingStart="$0" paddingEnd="$0" flex={1} gap="$3">
                        <Text opacity={0.7}>Capture a receipt or upload from gallery to extract items as a text.</Text>

                        <View style={styles.previewCard}>
                            {cameraPermission?.granted ? (
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

                        <YStack style={styles.textCard} gap="$2">
                            <XStack style={{ alignItems: 'center', gap: 8 }}>
                                <Text fontSize={14} fontWeight="700">Extracted Text</Text>
                                {isProcessing ? <ActivityIndicator size="small" /> : null}
                            </XStack>
                            <Text opacity={0.7} fontSize={12}>
                                {recognizedText || 'No text extracted yet.'}
                            </Text>
                        </YStack>
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                    <XStack gap="$2">
                        <Button onPress={handleCapture} flex={1}>
                            <Text>Capture</Text>
                        </Button>
                        <Button onPress={handlePickImage} flex={1}>
                            <Text>Upload</Text>
                        </Button>
                    </XStack>
                </View>
            </SafeAreaView>
        </>
    )
}

export default ScanReceipt;

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
        overflow: 'hidden',
        borderWidth: 0,
    },
    camera: {
        width: '80%',
        height: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 12,
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