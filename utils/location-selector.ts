/**
    import { subscribeLocationSelection } from '@/utils/location-selector';

    useEffect(() => {
        const unsubscribe = subscribeLocationSelection((selection) => {
            console.log('location updated', selection);
        });
        return unsubscribe;
    }, []);
 */

export type LocationSelection = {
    latitude: number;
    longitude: number;
    address?: string;
    purpose?: string;
};

type Listener = (selection: LocationSelection) => void;
type SubscribeOptions = {
    emitLast?: boolean;
};

const liveListeners = new Set<Listener>();
const selectedListeners = new Set<Listener>();
let lastSelection: LocationSelection | null = null;
let lastSelected: LocationSelection | null = null;

export const emitLocationSelection = (selection: LocationSelection) => {
    lastSelection = selection;
    liveListeners.forEach((listener) => listener(selection));
};

export const emitLocationSelected = (selection: LocationSelection) => {
    lastSelected = selection;
    selectedListeners.forEach((listener) => listener(selection));
};

export const subscribeLocationSelection = (listener: Listener, options: SubscribeOptions = {}) => {
    liveListeners.add(listener);
    if (options.emitLast !== false && lastSelection) {
        listener(lastSelection);
    }
    return () => liveListeners.delete(listener);
};

export const subscribeLocationSelected = (listener: Listener, options: SubscribeOptions = {}) => {
    selectedListeners.add(listener);
    if (options.emitLast !== false && lastSelected) {
        listener(lastSelected);
    }
    return () => selectedListeners.delete(listener);
};

export const getLastLocationSelection = () => lastSelection;
export const getLastLocationSelected = () => lastSelected;
