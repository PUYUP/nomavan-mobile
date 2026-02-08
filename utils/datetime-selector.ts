export type DateTimeSelection = {
    date: Date;
    iso: string;
    timestamp: number;
    purpose?: string;
};

type Listener = (selection: DateTimeSelection) => void;
type SubscribeOptions = {
    emitLast?: boolean;
};

const liveListeners = new Set<Listener>();
const selectedListeners = new Set<Listener>();
let lastSelection: DateTimeSelection | null = null;
let lastSelected: DateTimeSelection | null = null;

export const emitDateTimeSelection = (selection: DateTimeSelection) => {
    lastSelection = selection;
    liveListeners.forEach((listener) => listener(selection));
};

export const emitDateTimeSelected = (selection: DateTimeSelection) => {
    lastSelected = selection;
    selectedListeners.forEach((listener) => listener(selection));
};

export const subscribeDateTimeSelection = (listener: Listener, options: SubscribeOptions = {}) => {
    liveListeners.add(listener);
    if (options.emitLast !== false && lastSelection) {
        listener(lastSelection);
    }
    return () => liveListeners.delete(listener);
};

export const subscribeDateTimeSelected = (listener: Listener, options: SubscribeOptions = {}) => {
    selectedListeners.add(listener);
    if (options.emitLast !== false && lastSelected) {
        listener(lastSelected);
    }
    return () => selectedListeners.delete(listener);
};

export const getLastDateTimeSelection = () => lastSelection;
export const getLastDateTimeSelected = () => lastSelected;
