import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, View, YStack } from "tamagui";

const Index = () => {
    const router = useRouter();
    const floatA = useRef(new Animated.Value(0)).current;
    const floatB = useRef(new Animated.Value(0)).current;
    const floatC = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loopA = Animated.loop(
            Animated.sequence([
                Animated.timing(floatA, { toValue: 1, duration: 2400, useNativeDriver: true }),
                Animated.timing(floatA, { toValue: 0, duration: 2400, useNativeDriver: true }),
            ])
        );
        const loopB = Animated.loop(
            Animated.sequence([
                Animated.timing(floatB, { toValue: 1, duration: 2800, useNativeDriver: true }),
                Animated.timing(floatB, { toValue: 0, duration: 2800, useNativeDriver: true }),
            ])
        );
        const loopC = Animated.loop(
            Animated.sequence([
                Animated.timing(floatC, { toValue: 1, duration: 2600, useNativeDriver: true }),
                Animated.timing(floatC, { toValue: 0, duration: 2600, useNativeDriver: true }),
            ])
        );

        loopA.start();
        loopB.start();
        loopC.start();

        return () => {
            loopA.stop();
            loopB.stop();
            loopC.stop();
        };
    }, [floatA, floatB, floatC]);

  // Add any logic here to determine where to redirect
  // For example, an authentication check
//   const isAuthenticated = true; 

//   if (isAuthenticated) {
//     // Redirect to the tabs layout file path, typically wrapped in a group like '(tabs)'
//     return <Redirect href="/(auth)/register" />; 
//   }
  
  // Or redirect to a login page if not authenticated
  // return <Redirect href="/login" />;

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
                <YStack paddingStart="$0" paddingEnd="$0" flex={1} gap="$2">
                    <View style={styles.heroWrap}>
                        <YStack style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Inter-Black', fontSize: 54, marginBottom: 2 }}>Nomavan</Text>
                            <Text fontSize="$3">Where Vanlifers Help Vanlifers</Text>
                        </YStack>

                        <YStack marginBlockStart={'40%'} marginStart={'6%'} marginEnd={'6%'}>
                            <Animated.View
                                style={[
                                    styles.valueChip,
                                    styles.chipA,
                                    {
                                        transform: [
                                            {
                                                translateY: floatA.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -8],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#0f5132" />
                                <Text fontSize={13} opacity={0.8}>Mini Guessr Game</Text>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.valueChip,
                                    styles.chipB,
                                    {
                                        transform: [
                                            {
                                                translateY: floatB.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 10],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons name="account-group" size={20} color="#1d4ed8" />
                                <Text fontSize={13} opacity={0.8}>Meet nearby</Text>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.valueChip,
                                    styles.chipC,
                                    {
                                        transform: [
                                            {
                                                translateY: floatC.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -6],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons name="receipt-text" size={20} color="#9a3412" />
                                <Text fontSize={13} opacity={0.8}>Cost smart routes</Text>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.valueChip,
                                    styles.chipD,
                                    {
                                        transform: [
                                            {
                                                translateY: floatB.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 10],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons name="truck-off-road" size={20} color="#c30490" />
                                <Text fontSize={13} opacity={0.8}>En-route together</Text>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.valueChip,
                                    styles.chipE,
                                    {
                                        transform: [
                                            {
                                                translateY: floatB.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 10],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons name="microsoft-internet-explorer" size={20} color="#03b082" />
                                <Text fontSize={13} opacity={0.8}>Internet coverage info</Text>
                            </Animated.View>
                        </YStack>
                    </View>
                </YStack>
                
                <YStack gap="$3" marginBlockEnd="$6" paddingStart="$4" paddingEnd="$4">
                    <Button 
                        onPress={() => router.push('/(auth)/register')}
                        bg="$orange9" 
                        pressStyle={{ bg: "$orange10"}} 
                        hoverStyle={{ bg: "$orange10" }}
                        marginBlockStart="$3"
                    >
                        <MaterialCommunityIcons name="account-plus-outline" size={22} color={'white'} />
                        <Text color={'white'} fontSize={17}>Register</Text>
                    </Button>

                    <Button onPress={() => router.push('/(auth)/login')}>
                        <MaterialCommunityIcons name="login" size={22} />
                        <Text fontSize={17}>Log in</Text>
                    </Button>
                </YStack>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    ); // or other content
}

export default Index;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 16,
        flexGrow: 1,
        justifyContent: 'center',
    },
    heroWrap: {
        position: 'relative',
        minHeight: 220,
        justifyContent: 'center',
    },
    valueChip: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    chipA: {
        left: 8,
        top: 24,
    },
    chipB: {
        right: 6,
        top: 102,
    },
    chipC: {
        left: 124,
        bottom: 34,
    },
    chipD: {
        left: 26,
        top: 170,
    },

    chipE: {
        right: 26,
        top: 255,
    },
});