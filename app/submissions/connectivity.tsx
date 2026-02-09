import { ConnectivityPayload, useCreateConnectivityMutation } from '@/services/connectivity';
import { subscribeLocationSelected } from '@/utils/location-selector';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import { Stack, useRouter } from 'expo-router';
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
	strength: string;
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

const ConnectivitySubmission = () => {
	const router = useRouter();
	const [signalInfo, setSignalInfo] = useState<SignalInfo>();
    const [locationName, setLocationName] = useState('');
	const [submitConnectivity, { isLoading }] = useCreateConnectivityMutation({ fixedCacheKey: 'submit-connectivity-process' });

	const { control, handleSubmit, setValue, reset } = useForm<SignalInfo>();
	const onSubmit: SubmitHandler<SignalInfo> = async (data) => {
		console.log('Submit!');
		console.log(data);

		const payload: ConnectivityPayload = {
			content: '',
			status: 'publish',
			meta: {
				latitude: data.lat,
				longitude: data.lng,
				address: locationName,
				carrier: data.carrier,
				generation: data.cellularGeneration,
				type: data.type,
				strength: data.strength ? parseFloat(data.strength) : 0,
				internet_available: data.internetAvailable,
			}
		}

		const result = await submitConnectivity(payload);
		if (result && result.data) {
			router.back();
			reset();
		}
	};

	useEffect(() => {
		const onMount = async () => {
			const info = await NetInfo.refresh();
			const carrier = info.details && 'carrier' in info.details ? info.details.carrier as string : null;
			const cellularGeneration = info.details && 'cellularGeneration' in info.details ? info.details.cellularGeneration as string : null;
			const isConnectionExpensive = info.details && 'isConnectionExpensive' in info.details ? info.details.isConnectionExpensive as boolean : false;
			const isInternetReachable = info.isInternetReachable ? info.isInternetReachable : false;

			const nextSignalInfo: SignalInfo = {
				type: info.type,
				carrier: carrier ? carrier : '',
				cellularGeneration: cellularGeneration ? cellularGeneration: '',
				internetAvailable: isConnectionExpensive || isInternetReachable,
				strength: '',
				lat: 0,
				lng: 0
			};

			setSignalInfo(nextSignalInfo);
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

	useEffect(() => {
		const unsubscribeLocation = subscribeLocationSelected((selection) => {
			if (selection && selection.purpose === 'connectivity') {
				setLocationName(selection.address as string);
				setSignalInfo((prev: SignalInfo | undefined) => {
					return prev ? {
						...prev,
						lat: selection.latitude || prev.lat,
						lng: selection.longitude || prev.lng,
					} : prev;
				});
			}
		}, { emitLast: false });

		return () => {
			unsubscribeLocation();
		};
	}, []);

	return (
		<SafeAreaView style={styles.safeArea} edges={['bottom']}>
			<Stack.Screen 
                options={{ 
                    title: 'Connectivity', 
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
				<YStack marginStart="$2" paddingEnd="$2">
					{signalInfo?.lat && signalInfo?.lng ?
						<XStack style={styles.inputStack}>
							<XStack flex={1} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
								<XStack style={{ alignItems: 'center' }}>
									<MaterialCommunityIcons name='crosshairs-gps' size={26} style={styles.inputIcon} />
									
									<Text style={styles.inputText}>{signalInfo?.lat}</Text>
									<Text marginStart={1} marginEnd={3}>,</Text>
									<Text style={styles.inputText}>{signalInfo?.lng}</Text>
								</XStack>
							</XStack>
						</XStack>
						: null
					}

					<XStack style={[styles.inputStack, { alignItems: locationName ? 'start' : 'center' }]}>
						<MaterialCommunityIcons name='map-marker-radius-outline' size={26} style={styles.inputIcon} />
						<Text style={[styles.inputText, { fontSize: 14, flex: 1, paddingRight: 8 }]}>{locationName != '' ? locationName : 'Not set yet'}</Text>
						<Button size={'$2'} width={80} onPress={() => router.push({
							pathname: '/modals/map',
							params: {
								purpose: 'connectivity',
								address: locationName,
								initialLat: signalInfo?.lat,
								initialLng: signalInfo?.lng,
							}
						})}>
							<Text>{locationName ? 'Change' : 'Locate'}</Text>
						</Button>
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
										autoCapitalize="none"
										autoComplete="off"
										spellCheck={false}
										autoCorrect={false}
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
			</KeyboardAwareScrollView>

            <View style={{ marginTop: 'auto', paddingHorizontal: 32, paddingBlockEnd: 6 }}>
                <Text opacity={0.8}>All values (location, carrier, signal strength) are required to ensure data accuracy.</Text>
				<Button onPress={handleSubmit(onSubmit)} style={styles.submitButton} disabled={isLoading ? true : false}>
					{isLoading ? <ActivityIndicator color={'#fff'} /> : null}
                    <Text color={'white'} fontSize={20}>Share</Text>
                </Button>
            </View>
		</SafeAreaView>
	);
}

export default ConnectivitySubmission;

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
	},
	scrollContent: {
		padding: 12,
		paddingBottom: 16,
        paddingTop: 16,
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
		fontSize: 15,
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
		marginTop: 10,
	},
});