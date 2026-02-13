import { ExpensePayload, useCreateExpenseMutation } from "@/services/apis/expense-api";
import { useGetItemsMutation } from "@/services/receipt-extractor";
import { LocationSelection, subscribeLocationSelected } from "@/utils/location-selector";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { Dialog, Input, TextArea } from "tamagui";

interface Expense {
    items: Item[]
    content: string
    storeName: string
    lat: number
    lng: number
    placeName: string
}

interface Item {
    name: string
    qty: string
    price: string
}

const dummyItems: Item[] = [];

const ExpenseSubmission = () => {
    const router = useRouter();
    const [content, setContent] = useState<string>('');
    const [items, setItems] = useState(dummyItems);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
    const [summary, setSummary] = useState(null);
    const [editorOpen, setEditorOpen] = useState<boolean>(false);
    const [noteOpen, setNoteOpen] = useState<boolean>(false);
    const [storeNameOpen, setStoreNameOpen] = useState<boolean>(false);
    const { control: controlItem, handleSubmit: saveItem, reset: resetItem } = useForm<Item>();
    const { control: controlNote, handleSubmit: saveNote, reset: resetNote } = useForm<Expense>();
    const { control: controlStoreName, handleSubmit: saveStoreName, reset: resetStoreName } = useForm<Expense>();
    const { 
        control: controlExpense,
        handleSubmit: saveExpense,
        reset: resetExpense,
        getValues: expenseValues,
        setValue: setExpenseValue
    } = useForm<Expense>();
    const [placeName, setPlaceName] = useState<string | undefined>('');
    const [location, setLocation] = useState<LocationSelection | undefined>();
    const [storeName, setStoreName] = useState<string | undefined>('');
    const [, result] = useGetItemsMutation({ fixedCacheKey: 'receipt-process' });
    const [submitExpense, { isLoading }] = useCreateExpenseMutation();

    const onSubmit: SubmitHandler<Item> = (data) => {
        if (selectedItemIndex != null) {
            updateItem(selectedItemIndex, data);
        } else {
            setItems((prev) => [...prev, data]);
        }
        setEditorOpen(false);
    };

    const onNoteSubmit: SubmitHandler<Expense> = (data) => {
        setContent(data.content);
        setNoteOpen(false);
    };

    const onStoreNameSubmit: SubmitHandler<Expense> = (data) => {
        setStoreName(data.storeName);
        setStoreNameOpen(false);
    };

    const updateItem = (index: number, patch: Partial<Item>) => {
        setItems((prev) =>
            prev.map((item, id) => (id === index ? { ...item, ...patch } : item))
        );
    };

    const deleteItem = () => {
        if (selectedItemIndex === null) {
            return;
        }
        setItems((prev) => prev.filter((_, id) => id !== selectedItemIndex));
        setEditorOpen(false);
        setSelectedItem(null);
        setSelectedItemIndex(null);
        resetItem();
    };

    const addItem = () => {
        setSelectedItemIndex(null);
        setSelectedItem({ name: '', qty: '1', price: '' });
    }

    const updateQtyBy = (index: number, delta: number) => {
        setItems((prev) =>
            prev.map((item, id) =>
                id === index
                    ? { ...item, qty: Math.max(0, parseFloat(item.qty) + delta)?.toString() }
                    : item
            )
        );
    };

    const editItem = async (index: number, item: Item) => {
        setSelectedItem(item);
        setSelectedItemIndex(index);
    }

    /**
     * Share button handler
     */
    const shareHandler = async () => {
        const payload: ExpensePayload = {
            content: content,
            status: 'publish',
            meta: {
                latitude: location?.latitude ? location.latitude : 0,
                longitude: location?.longitude ? location.longitude : 0,
                place_name: location?.placeName ? location?.placeName : '',
                store_name: storeName ? storeName : '',
                expense_items_inline: items.map(item => {
                    return {
                        name: item.name,
                        quantity: item.qty,
                        price: item.price,
                    }
                })
            }
        }

        if (items.length > 0) {
            const result = await submitExpense(payload);
            if (result && result.data) {
                router.back();
            }
        }
    }

    useEffect(() => {
        if (result.isSuccess) {
            const nextItems = result?.data?.result?.items ?? [];
            setItems(
                nextItems.map((item: Item) => ({
                    name: item.name ?? '',
                    qty: Number(item.qty ?? 0),
                    price: String(item.price ?? ''),
                }))
            );
            setSummary(result?.data?.result?.summary);
        }
    }, [result.isSuccess]);

    useEffect(() => {
        setExpenseValue('items', items);
    }, [items, setExpenseValue]);

    useEffect(() => {
        if (!editorOpen) {
            // reset selected item
            setSelectedItem(null);
            resetItem();
            return;
        }
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            setEditorOpen(false);
            return true;
        });

        return () => subscription.remove();
    }, [editorOpen]);

    useEffect(() => {
        if (selectedItem) {
            resetItem({
                name: selectedItem.name,
                qty: selectedItem.qty?.toString(),
                price: selectedItem.price?.toString(),
            });
            setEditorOpen(true);
        }
    }, [selectedItem, resetItem]);

    useEffect(() => {
        const unsubscribeLocation = subscribeLocationSelected((selection) => {
            if (selection && selection.purpose === 'expense') {
                setLocation(selection);
                setPlaceName(selection.placeName);

                setExpenseValue('placeName', selection.placeName as string);
                setExpenseValue('lat', selection.latitude);
                setExpenseValue('lng', selection.longitude);
            }
        }, { emitLast: false });

        return () => {
            unsubscribeLocation();
        };
    }, []);

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Stack.Screen 
                    options={{ 
                        headerShown: true,
                        title: '', 
                        headerLeft: () => {
                            return (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                                        <MaterialCommunityIcons name="chevron-left" size={30} />
                                    </Pressable>
                                    <Text style={styles.headerTitle}>Expense</Text>
                                </View>
                            )
                        },
                        headerRight: () => {
                            return (
                                <View style={{ flexDirection: 'row', width: 160, gap: 8, alignItems: 'center' }}>
                                    <Pressable
                                        onPress={() => addItem()}
                                        style={styles.headerButton}
                                    >
                                        <MaterialCommunityIcons name="basket-plus-outline" size={20} />
                                        <Text style={styles.headerButtonText}>Entry</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => router.push('/submissions/expenses/scan-receipt')}
                                        style={styles.headerButton}
                                    >
                                        <MaterialCommunityIcons name="receipt-text-plus-outline" size={20} />
                                        <Text style={styles.headerButtonText}>Scan</Text>
                                    </Pressable>
                                </View>
                            )
                        }
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
                    <View style={{ gap: 8 }}>
                        {items.length === 0 ? (
                            <Text style={styles.emptyNote}>
                                Currently empty, entry manually or scan receipt
                            </Text>
                        ) : null}
                        {items.map((item: Item, index) => (
                            <View 
                                key={`${index}`} 
                                style={[styles.item, { flex: 1, justifyContent: 'space-between' }]}
                            >
                                <View style={{ minWidth: 20 }}>
                                    <Text style={styles.itemNumber}>{index + 1}.</Text>
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                        <MaterialCommunityIcons name="tag-outline" size={16} color="#f97316" />
                                        <Text style={styles.itemPrice}>{item.price}</Text>
                                    </View>
                                </View>

                                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Pressable
                                            onPress={() => updateQtyBy(index, -1)}
                                            style={[styles.qtyButton, styles.decreaseButton]}
                                        >
                                            <MaterialCommunityIcons name="minus" size={20} color="#fff" />
                                        </Pressable>

                                        <Text style={styles.qtyText}>{item.qty}</Text>

                                        <Pressable
                                            onPress={() => updateQtyBy(index, 1)}
                                            style={[styles.qtyButton, styles.increaseButton]}
                                        >
                                            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                                        </Pressable>
                                    </View>

                                    <Pressable
                                        onPress={async () => await editItem(index, item)}
                                        style={styles.editButton}
                                    >
                                        <MaterialCommunityIcons name="playlist-edit" size={22} />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </View>
                </KeyboardAwareScrollView>

                <View style={styles.bottomSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <MaterialCommunityIcons name="store-settings-outline" size={24} />
                            <Text style={styles.infoText}>
                                {storeName ? storeName: 'Not set yet'}
                            </Text>
                        </View>
                        <Pressable onPress={() => setStoreNameOpen(true)} style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>{storeName ? 'Change' : 'Set store'}</Text>
                        </Pressable>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <MaterialCommunityIcons name="note-edit-outline" size={24} />
                            <Text style={styles.infoText}>
                                {content ? content: 'Not set yet'}
                            </Text>
                        </View>
                        <Pressable onPress={() => setNoteOpen(true)} style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>{content ? 'Change' : 'Add note'}</Text>
                        </Pressable>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <MaterialCommunityIcons name="map-marker-radius-outline" size={24} />
                            <Text style={styles.infoText}>
                                {placeName ? placeName : 'Not set yet'}
                            </Text>
                        </View>
                        <Pressable onPress={() => router.push({
                            pathname: '/modals/map',
                            params: {
                                purpose: 'expense',
                                placeName: location?.placeName,
                                initialLat: location?.latitude,
                                initialLng: location?.longitude,
                            }
                        })} style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>{placeName ? 'Change' : 'Locate'}</Text>
                        </Pressable>
                    </View>
                    
                    <Pressable 
                        onPress={async () => await shareHandler()} 
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        disabled={isLoading}
                    >
                        {isLoading ? <ActivityIndicator color={'white'} /> : null}
                        <Text style={styles.submitButtonText}>Share</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
            
            {/* item dialog editor */}
            <Dialog
                open={editorOpen}
                disableRemoveScroll={false}
                onOpenChange={(open) => {
                    setEditorOpen(open);
                    if (!open) {
                        setSelectedItem(null);
                        resetItem();
                    }
                }}
                modal={true}
            >
                <Dialog.Portal>
                    <Dialog.Overlay
                        bg="$shadow6"
                        key={'item-editor'}
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />
                    <Dialog.Content unstyled width={320} style={{ zIndex: 99999 }}>
                        <KeyboardAwareScrollView
                            contentContainerStyle={styles.dialogScrollContent}
                            enableOnAndroid
                            extraScrollHeight={24}
                            keyboardOpeningTime={0}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.innerContent}>
                                <View style={styles.dialogHeader}>
                                    <Text style={styles.dialogTitle}>Item editor</Text>

                                    <Dialog.Close asChild>
                                        <Pressable
                                            style={styles.dialogClose}
                                            accessibilityLabel="Close dialog"
                                        >
                                            <MaterialCommunityIcons name="close" size={22} />
                                        </Pressable>
                                    </Dialog.Close>
                                </View>
                            
                                <View style={{ gap: 12 }}>
                                    <Controller
                                        name="name"
                                        control={controlItem}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <TextArea 
                                                onChange={onChange} 
                                                value={value} 
                                                placeholder="Item name" 
                                            />
                                        )}
                                    />

                                    <View style={{ gap: 12 }}>
                                        <View style={{ flex: 1 }}>
                                            <Controller
                                                name="price"
                                                control={controlItem}
                                                rules={{ required: true }}
                                                render={({ field: { onChange, value } }) => (
                                                    <Input 
                                                        onChange={onChange}
                                                        value={value}
                                                        placeholder="Price"
                                                        keyboardType="decimal-pad"
                                                        autoCapitalize="none"
                                                        autoComplete="off"
                                                        spellCheck={false}
                                                        autoCorrect={false}
                                                    />
                                                )}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.dialogActions}>
                                        {selectedItemIndex !== null ? (
                                            <Pressable onPress={deleteItem} style={[styles.dialogButton, styles.deleteButton]}>
                                                <MaterialCommunityIcons name="delete-empty-outline" size={20} color="#dc2626" />
                                                <Text style={styles.deleteButtonText}>Delete</Text>
                                            </Pressable>
                                        ) : null}

                                        <Pressable 
                                            onPress={saveItem(onSubmit)} 
                                            style={[styles.dialogButton, styles.saveButton, selectedItemIndex === null && { flex: 1 }]}
                                        >
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        </Pressable>
                                    </View>   
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>

            {/* content / note dialog */}
            <Dialog
                open={noteOpen}
                disableRemoveScroll={false}
                onOpenChange={(open) => {
                    setNoteOpen(open);
                    if (!open) {
                        resetNote();
                    }
                }}
                modal={true}
            >
                <Dialog.Portal>
                    <Dialog.Overlay
                        bg="$shadow6"
                        key={'item-editor'}
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />
                    <Dialog.Content unstyled width={320} style={{ zIndex: 99999 }}>
                        <KeyboardAwareScrollView
                            contentContainerStyle={styles.dialogScrollContent}
                            enableOnAndroid
                            extraScrollHeight={24}
                            keyboardOpeningTime={0}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.innerContent}>
                                <View style={styles.dialogHeader}>
                                    <Text style={styles.dialogTitle}>Note editor</Text>

                                    <Dialog.Close asChild>
                                        <Pressable
                                            style={styles.dialogClose}
                                            accessibilityLabel="Close dialog"
                                        >
                                            <MaterialCommunityIcons name="close" size={22} />
                                        </Pressable>
                                    </Dialog.Close>
                                </View>
                            
                                <View style={{ gap: 12 }}>
                                    <Controller
                                        name="content"
                                        control={controlNote}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <TextArea 
                                                onChange={onChange} 
                                                value={value} 
                                                placeholder="Additional note" 
                                            />
                                        )}
                                    />

                                    <View style={styles.dialogActions}>
                                        <Pressable 
                                            onPress={saveNote(onNoteSubmit)} 
                                            style={[styles.dialogButton, styles.saveButton, { flex: 1 }]}
                                        >
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        </Pressable>
                                    </View>   
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>

            {/* store name dialog */}
            <Dialog
                open={storeNameOpen}
                disableRemoveScroll={false}
                onOpenChange={(open) => {
                    setStoreNameOpen(open);
                    if (!open) {
                        resetStoreName();
                    }
                }}
                modal={true}
            >
                <Dialog.Portal>
                    <Dialog.Overlay
                        bg="$shadow6"
                        key={'item-editor'}
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />
                    <Dialog.Content unstyled width={320} style={{ zIndex: 99999 }}>
                        <KeyboardAwareScrollView
                            contentContainerStyle={styles.dialogScrollContent}
                            enableOnAndroid
                            extraScrollHeight={24}
                            keyboardOpeningTime={0}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.innerContent}>
                                <View style={styles.dialogHeader}>
                                    <Text style={styles.dialogTitle}>Store name editor</Text>

                                    <Dialog.Close asChild>
                                        <Pressable
                                            style={styles.dialogClose}
                                            accessibilityLabel="Close dialog"
                                        >
                                            <MaterialCommunityIcons name="close" size={22} />
                                        </Pressable>
                                    </Dialog.Close>
                                </View>
                            
                                <View style={{ gap: 12 }}>
                                    <Controller
                                        name="storeName"
                                        control={controlStoreName}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <TextArea 
                                                onChange={onChange} 
                                                value={value} 
                                                placeholder="Store name" 
                                            />
                                        )}
                                    />

                                    <View style={styles.dialogActions}>
                                        <Pressable 
                                            onPress={saveStoreName(onStoreNameSubmit)} 
                                            style={[styles.dialogButton, styles.saveButton, { flex: 1 }]}
                                        >
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>
        </>
    )
}

export default ExpenseSubmission;

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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Inter-Black',
        fontSize: 22,
        color: '#1F3D2B',
    },
    headerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        gap: 4,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    headerButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
    item: { 
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
        flex: 1,
        display: 'flex',
    },
    itemNumber: {
        fontSize: 14,
        opacity: 0.75,
        fontWeight: '700',
    },
    itemName: {
        fontSize: 14,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#f97316',
    },
    qtyButton: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    increaseButton: {
        backgroundColor: '#3cdca6',
    },
    decreaseButton: {
        backgroundColor: '#ff989f',
    },
    qtyText: {
        width: 38,
        textAlign: 'center',
        fontSize: 14,
    },
    editButton: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8d04c',
        marginLeft: 10,
    },
    bottomSection: {
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
        paddingTop: 8,
        marginTop: 'auto',
        paddingHorizontal: 16,
        paddingBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 16,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        maxWidth: '60%',
    },
    infoText: {
        fontSize: 13,
        opacity: 0.75,
        flex: 1,
    },
    actionButton: {
        width: 98,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#00bcd4',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    emptyNote: {
        opacity: 0.7,
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 12,
    },
    dialogClose: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
    },
    dialogScrollContent: {
        paddingBottom: 12,
    },
    innerContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
    },
    dialogHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dialogTitle: {
        fontSize: 20,
        fontFamily: 'Inter-Black',
    },
    dialogActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        justifyContent: 'space-between',
    },
    dialogButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    deleteButton: {
        backgroundColor: '#fee2e2',
    },
    deleteButtonText: {
        color: '#dc2626',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#f97316',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
})