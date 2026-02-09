import { emitDateTimeSelected, emitDateTimeSelection, getLastDateTimeSelected } from '@/utils/datetime-selector';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, View, XStack, YStack } from 'tamagui';

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
	const [hasPickedDate, setHasPickedDate] = useState(false);
	const [hasPickedTime, setHasPickedTime] = useState(false);

	useEffect(() => {
		const parsed = initialISO ? new Date(initialISO) : null;
		const fallback = getLastDateTimeSelected()?.date ?? null;
		const next = parsed && !Number.isNaN(parsed.getTime())
			? parsed
			: fallback ?? new Date();
		setValue(next);
		emitDateTimeSelection(toSelection(next, purpose));
		const hasInitial = Boolean(parsed && !Number.isNaN(parsed.getTime())) || Boolean(fallback);
		setHasPickedDate(hasInitial);
		setHasPickedTime(hasInitial);
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
					if (mode === 'date') {
						setHasPickedDate(true);
					} else {
						setHasPickedTime(true);
					}
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

	const androidDateText = hasPickedDate
		? value.toLocaleDateString(undefined, {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
		: 'Date not set';
	const androidTimeText = hasPickedTime
		? value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		: 'Time not set';

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
					<YStack gap="$3">
						{(!hasPickedDate || !hasPickedTime) ? (
							<Text opacity={0.7} fontSize={13}>
								Tap “Select date” and “Select time” to set a schedule.
							</Text>
						) : null}
						<View style={styles.selectionWrapper}>
							<XStack gap="$2" style={styles.selectionRow}>
								<Text fontSize={18} fontWeight="700">{androidDateText}</Text>
								<Text fontSize={18} fontWeight="700" opacity={0.7}>•</Text>
								<Text fontSize={18} fontWeight="700">{androidTimeText}</Text>
							</XStack>
						</View>
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
					</YStack>
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
	selectionWrapper: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		backgroundColor: '#f8fafc',
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	selectionRow: {
		alignItems: 'center',
		justifyContent: 'center',
		flexWrap: 'wrap',
	},
	submitButton: {
		backgroundColor: '#00bcd4',
		color: '#fff',
	},
});
