import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fridgeApi, mealPlanApi } from '../../services/api';

interface Props {
    navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [fridgeCount, setFridgeCount] = useState(0);
    const [expiringItems, setExpiringItems] = useState(0);
    const [todayMeals, setTodayMeals] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load fridge items
            const fridgeRes = await fridgeApi.getAll();
            const items = fridgeRes.data.data || [];
            setFridgeCount(items.length);

            // Count expiring items (within 3 days)
            const now = new Date();
            const expiring = items.filter((item: any) => {
                const expiryDate = new Date(item.expiryDate);
                const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return daysLeft <= 3 && daysLeft >= 0;
            });
            setExpiringItems(expiring.length);

            // Load today's meal plan
            const today = new Date().toISOString().split('T')[0];
            const mealRes = await mealPlanApi.getAll(today);
            setTodayMeals(mealRes.data.data || []);
        } catch (error) {
            console.error('Load dashboard error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const QuickAction = ({ icon, title, count, color, onPress }: any) => (
        <TouchableOpacity style={[styles.quickAction, { borderLeftColor: color }]} onPress={onPress}>
            <Text style={styles.quickIcon}>{icon}</Text>
            <View style={styles.quickInfo}>
                <Text style={styles.quickTitle}>{title}</Text>
                {count !== undefined && (
                    <Text style={[styles.quickCount, { color }]}>{count}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào,</Text>
                    <Text style={styles.name}>{user?.name || 'Người dùng'} 👋</Text>
                </View>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <QuickAction
                    icon=""
                    title="Trong tủ lạnh"
                    count={fridgeCount}
                    color="#00b894"
                    onPress={() => navigation.navigate('Fridge')}
                />
                <QuickAction
                    icon=""
                    title="Sắp hết hạn"
                    count={expiringItems}
                    color={expiringItems > 0 ? '#e17055' : '#636e72'}
                    onPress={() => navigation.navigate('Fridge')}
                />
            </View>

            {/* Today's Meals */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}> Bữa ăn hôm nay</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MealPlan')}>
                        <Text style={styles.seeAll}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>
                {todayMeals.length > 0 ? (
                    todayMeals.map((meal, index) => (
                        <View key={index} style={styles.mealItem}>
                            <Text style={styles.mealType}>
                                {meal.name === 'sáng' ? '' : meal.name === 'trưa' ? '' : ''} {meal.name}
                            </Text>
                            <Text style={styles.mealFood}>{meal.food?.name || 'Chưa có'}</Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyMeal}>
                        <Text style={styles.emptyText}>Chưa có kế hoạch bữa ăn</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('MealPlan')}
                        >
                            <Text style={styles.addButtonText}>+ Thêm ngay</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Shopping')}>
                        <Text style={styles.actionIcon}></Text>
                        <Text style={styles.actionText}>Danh sách{'\n'}mua sắm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Fridge')}>
                        <Text style={styles.actionIcon}></Text>
                        <Text style={styles.actionText}>Tủ lạnh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Recipe')}>
                        <Text style={styles.actionIcon}></Text>
                        <Text style={styles.actionText}>Công thức</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Group')}>
                        <Text style={styles.actionIcon}></Text>
                        <Text style={styles.actionText}>Gia đình</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#00b894',
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    quickAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    quickIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    quickInfo: {
        flex: 1,
    },
    quickTitle: {
        fontSize: 12,
        color: '#636e72',
    },
    quickCount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3436',
    },
    seeAll: {
        fontSize: 14,
        color: '#00b894',
    },
    mealItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    mealType: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2d3436',
        textTransform: 'capitalize',
    },
    mealFood: {
        fontSize: 14,
        color: '#636e72',
    },
    emptyMeal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#636e72',
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#00b894',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    actionCard: {
        width: '47%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        color: '#2d3436',
        textAlign: 'center',
    },
});

export default HomeScreen;
