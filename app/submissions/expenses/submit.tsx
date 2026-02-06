import { useGetItemsMutation } from "@/services/receipt-extractor-service";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { BackHandler, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Dialog, Input, Text, TextArea, View, XStack, YStack } from "tamagui";

interface Expense {
    items: Item[]
}

interface Item {
    name: string
    qty: string
    price: string
}

const dummyItems: Item[] = [
    {
        "name": "L French Fries",
        "qty": '1',
        "price": "3.29"
    },
    {
        "name": "S French Fries",
        "qty": '1',
        "price": "1.69"
    },
    {
        "name": "M Dr Pepper",
        "qty": '1',
        "price": "1.00"
    },
    {
        "name": "Kerupuk udang enak gurih nikmat 600 gram",
        "qty": '2',
        "price": "75.000"
    },
    {
        "name": "Bag",
        "qty": '1',
        "price": "0.00"
    }
];

const ExpenseSubmission = () => {
    const router = useRouter();
    const [items, setItems] = useState(dummyItems);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
    const [summary, setSummary] = useState(null);
    const [editorOpen, setEditorOpen] = useState<boolean>(false);
    const { control: controlItem, handleSubmit: saveItem, reset: resetItem } = useForm<Item>();
    const [, result] = useGetItemsMutation({
        fixedCacheKey: 'receipt-process',
    });

    const onSubmit: SubmitHandler<Item> = (data) => {
        console.log('Save item!');
        if (selectedItemIndex != null) {
            updateItem(selectedItemIndex, data);
        }
        setEditorOpen(false);
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

    const updateQtyBy = (index: number, delta: number) => {
        setItems((prev) =>
            prev.map((item, idx) =>
                idx === index
                    ? { ...item, qty: Math.max(0, parseFloat(item.qty) + delta).toString() }
                    : item
            )
        );
    };

    const editItem = async (index: number, item: Item) => {
        setSelectedItem(item);
        setSelectedItemIndex(index);
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
                qty: selectedItem.qty.toString(),
                price: selectedItem.price.toString(),
            });
            setEditorOpen(true);
        }
    }, [selectedItem, resetItem]);

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <Stack.Screen 
                    options={{ 
                        headerShown: true,
                        title: 'Expense', 
                        headerTitleStyle: {
                            fontSize: 22,
                            fontFamily: 'Inter-Black',
                            color: '#1F3D2B',
                        },
                        headerBackButtonDisplayMode: 'minimal' 
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
                    {/* <YStack paddingStart="$0" paddingEnd="$0" flex={1} gap="$2">
                        <Button onPress={() => router.push('/submissions/expenses/scan-receipt')}>Scan</Button>
                    </YStack> */}

                    <YStack gap="$2">
                        {items.map((item: Item, index) => (
                            <XStack 
                                key={`${index}`} 
                                gap="$2.5" 
                                marginBlockEnd="$2.5" 
                                style={styles.item}
                            >
                                <View paddingEnd="$2">
                                    <Text fontSize={14} fontWeight={700}>{index + 1}</Text>
                                </View>

                                <View flex={1} paddingEnd="$2">
                                    <Text>{item.name}</Text>
                                </View>

                                <View paddingEnd="$2">
                                    <Text>{item.price}</Text>
                                </View>

                                <XStack paddingEnd="$2" style={{ alignItems: 'center' }}>
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

                                <View>
                                    <Button
                                        size="$1"
                                        onPress={async () => await editItem(index, item)}
                                        style={styles.qtyButton}
                                    >
                                        <MaterialCommunityIcons name="playlist-edit" size={22} />
                                    </Button>
                                </View>
                            </XStack>
                        ))}
                    </YStack>
                </KeyboardAwareScrollView>

                <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                    <Button onPress={saveItem(onSubmit)} style={styles.submitButton}>
                        <Text color={'white'} fontSize={20}>Share Expense</Text>
                    </Button>
                </View>
            </SafeAreaView>

            <Dialog
                open={editorOpen}
                onOpenChange={(open) => {
                    setEditorOpen(open);
                    if (!open) {
                        setSelectedItem(null);
                        resetItem();
                    }
                }}
                modal
            >
                <Dialog.Portal>
                    <Dialog.Overlay
                        bg="$shadow6"
                        key={'item-editor'}
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />
                    <Dialog.Content width={320}>
                        <XStack marginBlockEnd="$3" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text fontSize={20} fontFamily={'Inter-Black'}>Item editor</Text>

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
                                            />
                                        )}
                                    />
                                </View>
                            </XStack>

                            <XStack gap="$3" marginBlockStart="$4" style={{ justifyContent: 'space-between' }}>
                                <View flex={1}>
                                    <Button onPress={deleteItem} width="100%">
                                        <MaterialCommunityIcons name="delete-empty-outline" size={24} />
                                        <Text color="$red10">Delete</Text>
                                    </Button>
                                </View>

                                <View flex={1}>
                                    <Button 
                                        onPress={saveItem(onSubmit)} 
                                        bg="$orange9" 
                                        color="$white" 
                                        pressStyle={{ bg: "$orange10"}} 
                                        hoverStyle={{ bg: "$orange10" }}
                                    >
                                        Save
                                    </Button>
                                </View>
                            </XStack>   
                        </YStack>
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
        alignItems: 'center',
    },
    dialogClose: {
        width: 36,
        height: 36,
        borderRadius: 15,
        zIndex: 9999,
    },
})