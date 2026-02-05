import { getCurrentLocation, reverseGeocodeLocation } from '@/utils/location-service';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, Platform, StyleSheet, Switch } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Label, RadioGroup, Text, View, XStack, YStack } from 'tamagui';

interface SignalInfo {
	type: string; // such as celular, wifi, etc
	carrier: string;
	cellularGeneration: string;
	internetAvailable: boolean;
	strength: string | undefined;
	lat: number;
	lng: number;
}

const RadioGroupItemWithLabel2 = (props: {
	value: string
	icon: any
	selected?: boolean
}) => {
	const id = `radiogroup-${props.value}`
	return (
		<XStack items="center" gap="$4">
			<RadioGroup.Item style={{ display: 'none' }} value={props.value} id={id}>
				<RadioGroup.Indicator />
			</RadioGroup.Item>

			<Label htmlFor={id}>
				<View style={[styles.signalItem, props.selected ? styles.signalItemSelected : null]}>
					<MaterialCommunityIcons name={props.icon} size={30} color={props.selected ? '#00bcd4' : undefined} />
				</View>
			</Label>
		</XStack>
	)
}

const SignalingSubmission = () => {
	const [signalInfo, setSignalInfo] = useState<SignalInfo>();
	const [locationError, setLocationError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
    const [locationName, setLocationName] = useState('');

	const { control, handleSubmit, setValue } = useForm<SignalInfo>();
	const onSubmit: SubmitHandler<SignalInfo> = (data) => {
		console.log('Submit!');
		console.log(data);
	};

	useEffect(() => {
		const onMount = async () => {
			setIsLoading(true);
			const info = await NetInfo.refresh();
			const carrier = info.details && 'carrier' in info.details ? info.details.carrier as string : null;
			const cellularGeneration = info.details && 'cellularGeneration' in info.details ? info.details.cellularGeneration as string : null;
			const isConnectionExpensive = info.details && 'isConnectionExpensive' in info.details ? info.details.isConnectionExpensive as boolean : false;
			const isInternetReachable = info.isInternetReachable ? info.isInternetReachable : false;

			const location = await getCurrentLocation();
			if (location.ok) {
                const coords = location.data.coords;
                const nextSignalInfo: SignalInfo = {
                    type: info.type,
                    carrier: carrier ? carrier : '',
                    cellularGeneration: cellularGeneration ? cellularGeneration: '',
                    internetAvailable: isConnectionExpensive || isInternetReachable,
                    strength: '',
                    lat: location.ok ? coords.latitude : 0,
                    lng: location.ok ? coords.longitude : 0
                };

                const address = await reverseGeocodeLocation(coords.latitude, coords.longitude);
                if (address.ok) {
                    console.log(address.data.name);
                    setLocationName(address.data.name);
                }
                setSignalInfo(nextSignalInfo);
            } else {
                setLocationError(location.error.message);
            }

			setIsLoading(false);
		};
		onMount();
	}, []);

	useEffect(() => {
		if (signalInfo) {
			(Object.entries(signalInfo) as Array<[keyof SignalInfo, SignalInfo[keyof SignalInfo]]>)
				.forEach(([key, value]) => {
					setValue(key, value);
				});
		}
	}, [signalInfo, setValue]);

	return (
		<SafeAreaView style={styles.safeArea} edges={['bottom']}>
			<Stack.Screen 
                options={{ 
                    title: 'Signaling', 
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
				{isLoading ? (
					<XStack style={styles.loadingRow}>
						<ActivityIndicator size="small" />
						<Text opacity={0.7} fontSize={12}>Fetching location...</Text>
					</XStack>
				) : (
					<>
						{locationError ? (
							<Text color="red" fontSize={12}>{locationError}</Text>
						) : null}
                        
						<YStack marginStart="$4" paddingEnd="$4">
							<XStack style={styles.inputStack}>
								<XStack flex={1} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
									<XStack style={{ alignItems: 'center' }}>
										<MaterialCommunityIcons name='latitude' size={26} style={styles.inputIcon} />
										<Text style={styles.inputText}>{signalInfo?.lat}</Text>
									</XStack>

									<Text fontSize={12} textTransform='lowercase' opacity={0.8}>Latitude</Text>
								</XStack>
							</XStack>

							<XStack style={styles.inputStack}>
								<XStack flex={1} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
									<XStack style={{ alignItems: 'center' }}>
										<MaterialCommunityIcons name='longitude' size={26} style={styles.inputIcon} />
										<Text style={styles.inputText}>{signalInfo?.lng}</Text>
									</XStack>

									<Text fontSize={12} textTransform='lowercase' opacity={0.8}>Longitude</Text>
								</XStack>
							</XStack>

                            <XStack style={styles.inputStack}>
                                <MaterialCommunityIcons name='map-marker-radius-outline' size={26} style={styles.inputIcon} />
                                <Text style={[styles.inputText, { fontSize: 14, flex: 1 }]}>{locationName != '' ? locationName : '-'}</Text>
                            </XStack>

							<XStack style={styles.inputStack}>
								<XStack flex={1} style={{justifyContent: 'space-between', alignItems: 'center' }}>
									<XStack style={{ alignItems: 'center' }}>
										<MaterialCommunityIcons name='router-network-wireless' size={26} style={styles.inputIcon} />
										<Text style={styles.inputText}>{signalInfo?.type}</Text>
									</XStack>

									{signalInfo?.cellularGeneration 
										? <Text textTransform={'uppercase'} fontWeight={800}>{signalInfo?.cellularGeneration}</Text>
										: null
									}
								</XStack>
							</XStack>

							<Controller
								control={control}
								name={'carrier'}
								rules={{ required: true }}
								render={({ field: { onChange, value } }) => (
									<XStack style={styles.inputStack}>
										<MaterialCommunityIcons name='flag-outline' size={26} style={styles.inputIcon} />
										{signalInfo?.carrier
											? <View width={200}><Text fontSize={14} numberOfLines={1} ellipsizeMode='tail' overflow='hidden'>{value}</Text></View>
											: <Input
												style={styles.input}
												onChangeText={onChange}
												value={value}
												flex={1}
												size="$3"
												placeholder={'Carrier'}
											/>
										}
									</XStack>
								)}
							/>

							<Controller
								control={control}
								name={'internetAvailable'}
								rules={{ required: true }}
								render={({ field: { onChange, value } }) => (
									<XStack style={styles.inputStack}>
										<MaterialCommunityIcons name='microsoft-internet-explorer' size={26} style={styles.inputIcon} />
										<XStack gap="$3" flex={1} style={{ alignItems: 'center', justifyContent: 'space-between' }}>
											<Text>Connected</Text>
											<Switch
												id="internetAvailable"
												trackColor={{false: '#767577', true: '#dcdbdc'}}
												thumbColor={value ? '#00bcd4' : '#f4f3f4'}
												ios_backgroundColor="#fff"
												onValueChange={onChange}
												value={!!value}
											/>
										</XStack>
									</XStack>
								)}
							/>

							<Controller
								control={control}
								name={'strength'}
								rules={{ required: true }}
								render={({ field: { onChange, value } }) => (
									<YStack style={{ marginTop: 10 }}>
										<XStack style={{justifyContent: 'space-between', alignItems: 'center' }}>
											<XStack style={{ alignItems: 'center' }}>
												<MaterialCommunityIcons name='network-strength-4-cog' size={26} style={styles.inputIcon} />
												<Text style={[styles.inputText, { fontSize: 15 }]}>Signal strength </Text>
											</XStack>
										</XStack>
                                        
										<RadioGroup onValueChange={onChange} value={value} name="strength" style={{ marginTop: 16 }}>
											<XStack items="center" gap="$2" style={{ justifyContent: 'space-between' }}>
												<RadioGroupItemWithLabel2 value="0" icon="signal-off" selected={value === '0'} />
												<RadioGroupItemWithLabel2 value="1" icon="signal-cellular-outline" selected={value === '1'} />
												<RadioGroupItemWithLabel2 value="2" icon="signal-cellular-1" selected={value === '2'} />
												<RadioGroupItemWithLabel2 value="3" icon="signal-cellular-2" selected={value === '3'} />
												<RadioGroupItemWithLabel2 value="4" icon="signal-cellular-3" selected={value === '4'} />
											</XStack>
										</RadioGroup>
									</YStack>
								)}
							/>
						</YStack>
					</>
				)}
			</KeyboardAwareScrollView>

            <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton}>
                    <Text color={'white'} fontSize={20}>Share</Text>
                </Button>
            </View>
		</SafeAreaView>
	);
}

export default SignalingSubmission;

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
	},
	scrollContent: {
		padding: 12,
		paddingBottom: 16,
        paddingTop: 32,
        height: '100%'
	},
	loadingRow: {
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
	},
	input: {
		borderWidth: 1, 
		paddingVertical: 5,
		paddingHorizontal: 4,
	},
	inputIcon: {
		marginRight: 16,
	},
	inputStack: {
		alignItems: 'center',
		marginBottom: 10,
	},
	inputText: {
		fontSize: 18,
	},
	signalItem: {
		backgroundColor: '#ececec',
		cursor: 'pointer',
		width: 52,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 60,
		borderWidth: 2,
		borderColor: '#d9d8d8',
		display: 'flex',
	},
	signalItemSelected: {
		backgroundColor: '#e0f7fa',
		borderWidth: 2,
		borderColor: '#00bcd4',
	},
	submitButton: {
		backgroundColor: '#00bcd4',
		color: '#fff',
		marginTop: 'auto',
	},
});