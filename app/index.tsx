import { useRouter } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, YStack } from "tamagui";

const Index = () => {
    const router = useRouter();

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
                    <YStack style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Inter-Black', fontSize: 48, marginBottom: 1 }}>Nomavan</Text>
                        <Text fontSize="$3">Where Vanlifers Help Vanlifers</Text>
                    </YStack>
                </YStack>
                
                <Text>Index</Text>
                <Button onPress={() => router.push('/(auth)/register')}>Register</Button>
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
    },
});