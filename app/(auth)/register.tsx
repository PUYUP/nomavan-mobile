import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Platform, StyleSheet } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button, Input, Text, XStack, YStack } from "tamagui"

interface Account {
    email: string
    password: string
    confirmPassword: string
}

const Register = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Account>()

    const onSubmit: SubmitHandler<Account> = (data) => console.log(data)
    const passwordValue = watch('password')

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
                        <Text fontSize="$7" fontWeight={700} marginBlockEnd={6}>Join the Community!</Text>
                        <Text fontSize="$3" lineHeight="$3" opacity={0.8}>Create your free account and start your journey with vanlifers worldwide.</Text>
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

                    <Controller
                        control={control}
                        name="confirmPassword"
                        rules={{
                            required: true,
                            validate: (value) => value === passwordValue || 'Passwords do not match',
                        }}
                        render={({ field: { onChange, value } }) => (
                            <XStack style={{ alignItems: 'center', position: 'relative' }} gap="$0">
                                <MaterialCommunityIcons name="key-arrow-right" size={26} style={styles.inputIcon} />
                                <Input 
                                    secureTextEntry={!showConfirmPassword}
                                    flex={1} 
                                    onChange={onChange} 
                                    size="$4" 
                                    placeholder="Confirm password" 
                                    borderWidth={1} 
                                    value={value} 
                                    paddingStart="$8"
                                    paddingEnd="$8"
                                />
                                <Button
                                    size="$2"
                                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                                    style={styles.inputToggle}
                                >
                                    <MaterialCommunityIcons
                                        name={showConfirmPassword ? "eye-off" : "eye"}
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
                    >
                        <Text color={'white'} fontSize={15}>Submit</Text>
                    </Button>
                </YStack>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default Register

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