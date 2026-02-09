import { ExpensePayload, useCreateExpenseMutation } from "@/services/expense";
import { useGetItemsMutation } from "@/services/receipt-extractor";
import { LocationSelection, subscribeLocationSelected } from "@/utils/location-selector";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, BackHandler, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Dialog, Input, Text, TextArea, View, XStack, YStack } from "tamagui";

interface Expense {
    items: Item[]
    content: string
    store: string
    lat: number
    lng: number
    address: string
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
    const [storeOpen, setStoreOpen] = useState<boolean>(false);
    const { control: controlItem, handleSubmit: saveItem, reset: resetItem } = useForm<Item>();
    const { control: controlNote, handleSubmit: saveNote, reset: resetNote } = useForm<Expense>();
    const { control: controlStore, handleSubmit: saveStore, reset: resetStore } = useForm<Expense>();
    const { 
        control: controlExpense,
        handleSubmit: saveExpense,
        reset: resetExpense,
        getValues: expenseValues,
        setValue: setExpenseValue
    } = useForm<Expense>();
    const [address, setAddress] = useState<string | undefined>('');
    const [location, setLocation] = useState<LocationSelection | undefined>();
    const [store, setStore] = useState<string | undefined>('');
    const [, result] = useGetItemsMutation({ fixedCacheKey: 'receipt-process' });
    const [submitExpense, { isLoading }] = useCreateExpenseMutation({ fixedCacheKey: 'submit-expense-process' });

    const onSubmit: SubmitHandler<Item> = (data) => {
        console.log('Save item!');
        if (selectedItemIndex != null) {
            updateItem(selectedItemIndex, data);
        } else {
            setItems((prev) => [...prev, data]);
        }
        setEditorOpen(false);
    };

    const onNoteSubmit: SubmitHandler<Expense> = (data) => {
        console.log('Save note!');
        setContent(data.content);
        setNoteOpen(false);
    };

    const onStoreSubmit: SubmitHandler<Expense> = (data) => {
        console.log('Save store!');
        setStore(data.store);
        setStoreOpen(false);
    };

    const updateItem = (index: number, patch: Partial<Item>) => {
        setItems((prev) =>
            prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
        );
    };

    const deleteItem = () => {
        if (selectedItemIndex === null) {
            return;
        }
        setItems((prev) => prev.filter((_, idx) => idx !== selectedItemIndex));
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
            prev.map((item, idx) =>
                idx === index
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
                latitude: location?.latitude ? location.latitude as unknown as string : '',
                longitude: location?.longitude ? location.longitude as unknown as string : '',
                address: location?.address ? location?.address : '',
                store: store ? store : '',
                expense_items_inline: items.map(item => {
                    return {
                        name: item.name,
                        quantity: item.qty,
                        price: item.price,
                    }
                })
            }
        }

        const result = await submitExpense(payload);
        if (result && result.data) {
            router.back();
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
                setAddress(selection.address);

                setExpenseValue('address', selection.address as string);
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
                                <XStack items={'center'} gap="$3">
                                    <Button size="$3" onPress={() => router.back()} circular>
                                        <MaterialCommunityIcons name="chevron-left" size={30} />
                                    </Button>
                                    <Text fontFamily={'Inter-Black'} fontSize={22} color={'#1F3D2B'}>Expense</Text>
                                </XStack>
                            )
                        },
                        headerRight: () => {
                            return (
                                <XStack width={160} gap="$2" items="center">
                                    <Button
                                        size="$2"
                                        flex={1}
                                        onPress={() => addItem()}
                                        icon={<MaterialCommunityIcons name="basket-plus-outline" size={20} />}
                                    >
                                        Entry
                                    </Button>
                                    <Button
                                        size="$2"
                                        flex={1}
                                        onPress={() => router.push('/submissions/expenses/scan-receipt')}
                                        icon={<MaterialCommunityIcons name="receipt-text-plus-outline" size={20} />}
                                    >
                                        Scan
                                    </Button>
                                </XStack>
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
                    <YStack gap="$2">
                        {items.length === 0 ? (
                            <Text style={styles.emptyNote}>
                                Currently empty, entry manually or scan receipt
                            </Text>
                        ) : null}
                        {items.map((item: Item, index) => (
                            <XStack 
                                key={`${index}`} 
                                gap="$2.5" 
                                marginBlockEnd="$2.5" 
                                style={styles.item}
                            >
                                <View minW={24}>
                                    <Text fontSize={14} opacity={0.75} fontWeight={700}>{index + 1}.</Text>
                                </View>

                                <YStack width={'55%'}>
                                    <View>
                                        <Text>{item.name}</Text>
                                    </View>

                                    <View>
                                        <Text fontWeight={700} opacity={0.8}>{item.price}</Text>
                                    </View>
                                </YStack>

                                <XStack style={{ alignItems: 'center' }}>
                                    <Button
                                        size="$1"
                                        onPress={() => updateQtyBy(index, -1)}
                                        style={[styles.qtyButton, { backgroundColor: styles.decreaseButton.backgroundColor }]}
                                    >
                                        <MaterialCommunityIcons name="minus" size={20} />
                                    </Button>

                                    <Text width={42} style={{ textAlign: 'center' }}>{item.qty}</Text>

                                    <Button
                                        size="$1"
                                        onPress={() => updateQtyBy(index, 1)}
                                        style={[styles.qtyButton, { backgroundColor: styles.increaseButton.backgroundColor }]}
                                    >
                                        <MaterialCommunityIcons name="plus" size={20} />
                                    </Button>
                                </XStack>

                                <Button
                                    size="$1"
                                    onPress={async () => await editItem(index, item)}
                                    style={styles.qtyButton}
                                >
                                    <MaterialCommunityIcons name="playlist-edit" size={22} />
                                </Button>
                            </XStack>
                        ))}
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 8, marginTop: 'auto', paddingHorizontal: 16, paddingBlockEnd: 6 }}>
                    <XStack marginBlockEnd="$3" gap="$4" style={{ justifyContent: 'space-between' }}>
                        <XStack maxW={'60%'} gap="$3">
                            <MaterialCommunityIcons name="store-settings-outline" size={24} />

                            <Text fontSize={store ? '$3' : '$3'} opacity={0.75}>
                                {store ? store: 'Not set yet'}
                            </Text>
                        </XStack>

                        <Button size={'$2'} width={98} onPress={() => setStoreOpen(true)}>
                            <Text>{store ? 'Change' : 'Set store'}</Text>
                        </Button>
                    </XStack>
                    
                    <XStack marginBlockEnd="$3" gap="$4" style={{ justifyContent: 'space-between' }}>
                        <XStack maxW={'60%'} gap="$3">
                            <MaterialCommunityIcons name="note-edit-outline" size={24} />

                            <Text fontSize={content ? '$2' : '$3'} opacity={0.75}>
                                {content ? content: 'Not set yet'}
                            </Text>
                        </XStack>

                        <Button size={'$2'} width={98} onPress={() => setNoteOpen(true)}>
                            <Text>{content ? 'Change' : 'Add note'}</Text>
                        </Button>
                    </XStack>

                    <XStack marginBlockEnd="$5" gap="$4" style={{ justifyContent: 'space-between' }}>
                        <XStack maxW={'60%'} gap="$3">
                            <MaterialCommunityIcons name="map-marker-radius-outline" size={24} />

                            <Text fontSize={address ? '$2' : '$3'} opacity={0.75}>
                                {address ? address : 'Not set yet'}
                            </Text>
                        </XStack>

                        <Button size={'$2'} width={98} onPress={() => router.push({
                            pathname: '/modals/map',
                            params: {
                                purpose: 'expense',
                                address: location?.address,
                                initialLat: location?.latitude,
                                initialLng: location?.longitude,
                            }
                        })}>
                            <Text>{address ? 'Change' : 'Locate'}</Text>
                        </Button>
                    </XStack>
                    
                    <Button 
                        onPress={async () => await shareHandler()} 
                        style={styles.submitButton}
                        disabled={isLoading ? true : false}
                    >
                        {isLoading ? <ActivityIndicator color={'white'} /> : null}
                        <Text color={'white'} fontSize={20}>Share</Text>
                    </Button>
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
                                <XStack marginBlockEnd="$3" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text fontSize={20} style={{ fontFamily: 'Inter-Black' }}>Item editor</Text>

                                    <Dialog.Close asChild>
                                        <Button
                                            size="$2"
                                            style={styles.dialogClose}
                                            accessibilityLabel="Close dialog"
                                        >
                                            <MaterialCommunityIcons name="close" size={22} />
                                        </Button>
                                    </Dialog.Close>
                                </XStack>
                            
                                <YStack gap="$3">
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

                                    <XStack gap="$3">
                                        <View flex={1}>
                                            <Controller
                                                name="price"
                                                control={controlItem}
                                                rules={{ required: true }}
                                                render={({ field: { onChange, value } }) => (
                                                    <Input 
                                                        onChange={onChange}
                                                        value={value}
                                                        placeholder="Price"
                                                        autoCapitalize="none"
                                                        autoComplete="off"
                                                        spellCheck={false}
                                                        autoCorrect={false}
                                                    />
                                                )}
                                            />
                                        </View>

                                        <View width={100}>
                                            <Controller
                                                name="qty"
                                                control={controlItem}
                                                rules={{ required: true }}
                                                render={({ field: { onChange, value } }) => (
                                                    <Input 
                                                        onChange={onChange} 
                                                        value={value} 
                                                        textAlign="center" 
                                                        placeholder="Qty" 
                                                        autoCapitalize="none"
                                                        autoComplete="off"
                                                        spellCheck={false}
                                                        autoCorrect={false}
                                                    />
                                                )}
                                            />
                                        </View>
                                    </XStack>

                                    <XStack gap="$3" marginBlockStart="$4" style={{ justifyContent: 'space-between' }}>
                                        {selectedItemIndex !== null ? (
                                            <View flex={1}>
                                                <Button onPress={deleteItem} width="100%">
                                                    <MaterialCommunityIcons name="delete-empty-outline" size={24} />
                                                    <Text color="$red10">Delete</Text>
                                                </Button>
                                            </View>
                                        ) : null}

                                        <View flex={1}>
                                            <Button 
                                                onPress={saveItem(onSubmit)} 
                                                bg="$orange9" 
                                                pressStyle={{ bg: "$orange10"}} 
                                                hoverStyle={{ bg: "$orange10" }}
                                            >
                                                <Text color="$white">Save</Text>
                                            </Button>
                                        </View>
                                    </XStack>   
                                </YStack>
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
                                <XStack marginBlockEnd="$3" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text fontSize={20} style={{ fontFamily: 'Inter-Black' }}>Note editor</Text>

                                    <Dialog.Close asChild>
                                        <Button
                                            size="$2"
                                            style={styles.dialogClose}
                                            accessibilityLabel="Close dialog"
                                        >
                                            <MaterialCommunityIcons name="close" size={22} />
                                        </Button>
                                    </Dialog.Close>
                                </XStack>
                            
                                <YStack gap="$3">
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

                                    <XStack gap="$3" marginBlockStart="$4" style={{ justifyContent: 'space-between' }}>
                                        <View flex={1}>
                                            <Button 
                                                onPress={saveNote(onNoteSubmit)} 
                                                bg="$orange9" 
                                                pressStyle={{ bg: "$orange10"}} 
                                                hoverStyle={{ bg: "$orange10" }}
                                            >
                                                <Text color="$white">Save</Text>
                                            </Button>
                                        </View>
                                    </XStack>   
                                </YStack>
                            </View>
                        </KeyboardAwareScrollView>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>

            {/* store name dialog */}
            <Dialog
                open={storeOpen}
                disableRemoveScroll={false}
                onOpenChange={(open) => {
                    setStoreOpen(open);
                    if (!open) {
                        resetStore();
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
                                <XStack marginBlockEnd="$3" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text fontSize={20} style={{ fontFamily: 'Inter-Black' }}>Store name editor</Text>

                                    <Dialog.Close asChild>
                                        <Button
                                            size="$2"
                                            style={styles.dialogClose}
                                            accessibilityLabel="Close dialog"
                                        >
                                            <MaterialCommunityIcons name="close" size={22} />
                                        </Button>
                                    </Dialog.Close>
                                </XStack>
                            
                                <YStack gap="$3">
                                    <Controller
                                        name="store"
                                        control={controlStore}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <TextArea 
                                                onChange={onChange} 
                                                value={value} 
                                                placeholder="Store name" 
                                            />
                                        )}
                                    />

                                    <XStack gap="$3" marginBlockStart="$4" style={{ justifyContent: 'space-between' }}>
                                        <View flex={1}>
                                            <Button 
                                                onPress={saveStore(onStoreSubmit)} 
                                                bg="$orange9" 
                                                pressStyle={{ bg: "$orange10"}} 
                                                hoverStyle={{ bg: "$orange10" }}
                                            >
                                                <Text color="$white">Save</Text>
                                            </Button>
                                        </View>
                                    </XStack>   
                                </YStack>
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
    safeAreaScroll: {
        flexGrow: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    submitButton: {
		backgroundColor: '#00bcd4',
		color: '#fff',
		marginTop: 'auto',
	},
    qtyButton: {
        width: 26,
        height: 26,
        borderRadius: 16,
    },
    editButton: {
        backgroundColor: '#00bcd4',
		color: '#fff',
    },
    increaseButton: {
        backgroundColor: '#3cdca6',
    },
    decreaseButton: {
        backgroundColor: '#ff989f',
    },
    item: { 
        alignItems: 'flex-start',
    },
    dialogClose: {
        width: 36,
        height: 36,
        borderRadius: 15,
        zIndex: 9999,
    },
    dialogAvoid: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    dialogScrollContent: {
        paddingBottom: 12,
    },
    innerContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
    },
    emptyNote: {
        opacity: 0.7,
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 12,
    },
})