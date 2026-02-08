import { emitDateTimeSelected, emitDateTimeSelection, getLastDateTimeSelected } from '@/utils/datetime-selector';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, XStack, YStack } from 'tamagui';

const toSelection = (date: Date, purpose?: string) => ({
	date,
	iso: date.toISOString(),
	timestamp: date.getTime(),
	purpose,
});

export default function DateTimeModal() {
	const router = useRouter();
	const { returnTo, initialISO, purpose } = useLocalSearchParams<{ returnTo?: string; initialISO?: string; purpose?: string }>();
	const [value, setValue] = useState<Date>(new Date());

	useEffect(() => {
		const parsed = initialISO ? new Date(initialISO) : null;
		const fallback = getLastDateTimeSelected()?.date ?? null;
		const next = parsed && !Number.isNaN(parsed.getTime())
			? parsed
			: fallback ?? new Date();
		setValue(next);
		emitDateTimeSelection(toSelection(next, purpose));
	}, [initialISO]);

	const handleChange = (next: Date) => {
		setValue(next);
		emitDateTimeSelection(toSelection(next, purpose));
	};

	const openAndroidPicker = (mode: 'date' | 'time') => {
		DateTimePickerAndroid.open({
			value,
			mode,
			is24Hour: true,
			onChange: (_, selectedDate) => {
				if (selectedDate) {
					handleChange(selectedDate);
				}
			},
		});
	};

	const formatted = useMemo(() => {
		return value.toLocaleString();
	}, [value]);

	const handleConfirm = () => {
		const selection = toSelection(value, purpose);
		emitDateTimeSelected(selection);
		if (returnTo) {
			router.replace({
				pathname: returnTo as any,
				params: {
					iso: selection.iso,
					timestamp: String(selection.timestamp),
					purpose,
				},
			});
			return;
		}
		router.back();
	};

	const purposeLabel = purpose === 'end'
		? 'End time'
		: purpose === 'start'
			? 'Start time'
			: 'Date & time';

	return (
		<SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Stack.Screen options={{
                title: `Select ${purposeLabel}`,
                headerTitleStyle: {
                fontSize: 20,
                fontFamily: 'Inter-Black',
                color: '#1F3D2B',
                },
                headerRight: () => {
                    return (
                        <Button
                        size="$3"
                        onPress={() => router.back()}
                        style={styles.closeButton}
                        accessibilityLabel="Close"
                        circular
                        >
                            <MaterialCommunityIcons name="close" size={20} />
                        </Button>
                    )
                }
            }} />

			<YStack paddingStart="$0" paddingEnd="$0" flex={1} gap="$3">
				{Platform.OS === 'ios' ? (
					<YStack gap="$0" style={{ alignItems: 'center', justifyContent: 'center' }}>
						<DateTimePicker
							value={value}
							mode="date"
							display="inline"
							onChange={(_, date) => date && handleChange(date)}
						/>
						<DateTimePicker
							value={value}
							mode="time"
							display="spinner"
                            minuteInterval={15}
							onChange={(_, date) => date && handleChange(date)}
						/>
					</YStack>
				) : (
					<XStack gap="$2">
						<Button flex={1} onPress={() => openAndroidPicker('date')}>
							<MaterialCommunityIcons name="calendar-month" size={18} />
							<Text>Select date</Text>
						</Button>
						<Button flex={1} onPress={() => openAndroidPicker('time')}>
							<MaterialCommunityIcons name="clock-outline" size={18} />
							<Text>Select time</Text>
						</Button>
					</XStack>
				)}

				<XStack marginBlockStart="auto" gap="$2">
					<Button flex={1} onPress={() => router.back()}>
						<Text fontSize={16}>Cancel</Text>
					</Button>
					<Button flex={1} onPress={handleConfirm} style={styles.submitButton}>
						<Text color={'white'} fontSize={16}>Use this time</Text>
					</Button>
				</XStack>
			</YStack>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 16,
	},
	modalHeader: {
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
	},
	previewCard: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		backgroundColor: '#f8fafc',
		padding: 12,
		gap: 6,
	},
	submitButton: {
		backgroundColor: '#00bcd4',
		color: '#fff',
	},
});
