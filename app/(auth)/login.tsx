import { saveAuth } from "@/services/auth-storage"
import { SigninPayload, useCreateSigninMutation } from "@/services/signin"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { ActivityIndicator, Platform, StyleSheet } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { Button, Input, Text, XStack, YStack } from "tamagui"

interface Account {
    email: string
    password: string
}

const Login = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { email } = useLocalSearchParams<{ email?: string }>();
    const [signIn, { isLoading, isSuccess }] = useCreateSigninMutation();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        setValue
    } = useForm<Account>({
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit: SubmitHandler<Account> = async (data) => {
        // hide previous toast
        try {
            Toast.hide();
        } catch(error) {
            // pass
        }
        
        const payload: SigninPayload = {
            username: data.email,
            password: data.password,
        }
        const result = await signIn(payload);

        if (result) {
            const { data, error } = result;

            if (data) {
                await saveAuth({
                    token: data.token,
                    user: {
                        id: data.user_id,
                        email: data.user_email,
                        nicename: data.user_nicename,
                        displayName: data.user_display_name,
                    },
                });
                router.push('/(tabs)/feed');

                Toast.show({
                    type: 'success',
                    position: 'top',
                    visibilityTime: 500,
                    text1: 'Log in successful',
                    text2: 'Welcome back and continue your journey!',
                });
            } 
            
            if (error) {
                if (typeof error === "object" && error !== null && "data" in error) {
                    const errorData = (error as { data?: { message?: string } }).data;
                    const errorMsg = errorData?.message ?? "Login failed";
                
                    Toast.show({
                        type: 'error',
                        position: 'top',
                        visibilityTime: 10000,
                        text1: 'Log in failed',
                        text2: errorMsg,
                    });
                } else {
                    console.log(error)
                }
            }
        }
    }

    useEffect(() => {
        if (email && typeof email === 'string') {
            setValue('email', email);
        }
    }, [email, setValue]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                enableOnAndroid
                extraScrollHeight={24}
                keyboardOpeningTime={0}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'never' : 'automatic'}
            >
                <YStack paddingStart="$2" paddingEnd="$2" flex={1} gap="$4">
                    <YStack marginBlockEnd={12}>
                        <Text fontSize="$7" fontWeight={700} marginBlockEnd={6}>Return to the Community</Text>
                        <Text fontSize="$3" lineHeight="$3" opacity={0.8}>Your vanlife network is waiting for you. Come back and see what’s happening on the road.</Text>
                    </YStack>

                    <Controller
                        control={control}
                        name="email"
                        rules={{ 
                            required: true,
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // Standard email regex
                                message: 'Invalid email address',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <XStack style={{ alignItems: 'center', position: 'relative' }} gap="$0">
                                <MaterialCommunityIcons name="email" size={26} style={styles.inputIcon} />
                                <Input 
                                    type="email" 
                                    flex={1} 
                                    onChange={onChange} 
                                    size="$4" 
                                    placeholder="Your email" 
                                    borderWidth={1} 
                                    value={value} 
                                    paddingStart="$8"
                                    autoCapitalize="none"
                                    autoComplete="none"
                                />
                            </XStack>
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                            <XStack style={{ alignItems: 'center', position: 'relative' }} gap="$0">
                                <MaterialCommunityIcons name="form-textbox-password" size={26} style={styles.inputIcon} />
                                <Input 
                                    secureTextEntry={!showPassword}
                                    flex={1} 
                                    onChange={onChange} 
                                    size="$4" 
                                    placeholder="Password" 
                                    borderWidth={1} 
                                    value={value} 
                                    paddingStart="$8"
                                    paddingEnd="$8"
                                    autoComplete="none"
                                />
                                <Button
                                    size="$2"
                                    onPress={() => setShowPassword((prev) => !prev)}
                                    style={styles.inputToggle}
                                >
                                    <MaterialCommunityIcons
                                        name={showPassword ? "eye-off" : "eye"}
                                        size={20}
                                    />
                                </Button>
                            </XStack>
                        )}
                    />

                    <Button 
                        onPress={handleSubmit(onSubmit)}
                        bg="$orange9" 
                        pressStyle={{ bg: "$orange10"}} 
                        hoverStyle={{ bg: "$orange10" }}
                        marginBlockStart="$3"
                        disabled={isLoading ? true : false}
                    >
                        {isLoading ? <ActivityIndicator color={'white'} /> : null}
                        <Text color={'white'} fontSize={16}>Log in</Text>
                    </Button>

                    <XStack marginBlockStart={8} style={{ justifyContent: 'center' }}>
                        <Button size="$3" onPress={() => router.push('/(auth)/register')} chromeless>
                            <Text fontSize={15} color="$blue10">Don't have account? Register</Text>
                        </Button>
                    </XStack>
                </YStack>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default Login

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
    inputIcon: {
        position: 'absolute',
        zIndex: 99999,
        left: 10,
    },
    inputToggle: {
        position: 'absolute',
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 16,
    },
});