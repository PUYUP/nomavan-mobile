import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

/**
 * Present RevenueCat paywall to user
 * @returns Promise<boolean> - true if purchased/restored, false otherwise
 */
export async function presentPaywall(): Promise<boolean> {
    try {
        const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

        switch (paywallResult) {
            case PAYWALL_RESULT.NOT_PRESENTED:
            case PAYWALL_RESULT.ERROR:
            case PAYWALL_RESULT.CANCELLED:
                return false;
            case PAYWALL_RESULT.PURCHASED:
            case PAYWALL_RESULT.RESTORED:
                return true;
            default:
                return false;
        }
    } catch (error) {
        console.error('Error presenting paywall:', error);
        return false;
    }
}
