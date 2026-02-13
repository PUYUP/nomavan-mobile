import { BPActivityFilterArgs, useGetActivitiesQuery } from '@/services/activity';
import ExpenseUpdate from '@/components/activity/expense-update';
import { Stack } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ExpenseInsights = () => {
    const queryArgs: BPActivityFilterArgs = {
        page: 1,
        per_page: 20,
        type: ['new_expense'],
    };

    const { data: expenses, isLoading, error, refetch } = useGetActivitiesQuery(queryArgs);

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <Stack.Screen 
                options={{ 
                    title: 'Expenses', 
                    headerTitleStyle: {
                        fontSize: 22,
                        fontFamily: 'Inter-Black',
                        color: '#1F3D2B',
                    },
                    headerBackButtonDisplayMode: 'minimal',
                }} 
            />

            {isLoading && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1F3D2B" />
                </View>
            )}

            {error && (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Failed to load expenses</Text>
                </View>
            )}

            {expenses && expenses.length === 0 && (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No expenses found</Text>
                </View>
            )}

            {expenses && expenses.length > 0 && (
                <FlatList
                    data={expenses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <ExpenseUpdate activity={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isLoading}
                />
            )}
        </SafeAreaView>
    );
}

export default ExpenseInsights;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        fontFamily: 'Inter-Medium',
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        fontFamily: 'Inter-Medium',
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
});