type FilterChangeListener = (filterType: string) => void;

let currentFilterType: string = 'all';
let listeners: FilterChangeListener[] = [];

export const setActivityFilter = (filterType: string) => {
    currentFilterType = filterType;
    listeners.forEach(listener => listener(filterType));
};

export const getActivityFilter = (): string => {
    return currentFilterType;
};

export const subscribeActivityFilter = (
    listener: FilterChangeListener,
    options: { emitLast: boolean } = { emitLast: true }
): (() => void) => {
    listeners.push(listener);

    // Emit current filter if requested
    if (options.emitLast) {
        listener(currentFilterType);
    }

    // Return unsubscribe function
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};
