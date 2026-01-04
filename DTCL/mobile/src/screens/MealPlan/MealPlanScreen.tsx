import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { mealPlanApi } from '../../services/api';

interface MealPlan {
    _id: string;
    food: { name: string };
    name: 'sáng' | 'trưa' | 'tối';
    mealType?: 'sáng' | 'trưa' | 'tối';
    timestamp: string;
}

// Get today's date at midnight local time
const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const MealPlanScreen: React.FC = () => {
    const [meals, setMeals] = useState<MealPlan[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [modalVisible, setModalVisible] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [mealType, setMealType] = useState<'sáng' | 'trưa' | 'tối'>('sáng');
    const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);

    useEffect(() => {
        loadMeals();
    }, [selectedDate]);

    const loadMeals = async () => {
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await mealPlanApi.getAll(dateStr);
            setMeals(res.data.data || []);
        } catch (error) {
            console.error('Load meals error:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadMeals();
        setRefreshing(false);
    }, [selectedDate]);

    const openAddModal = () => {
        setEditingMeal(null);
        setFoodName('');
        setMealType('sáng');
        setModalVisible(true);
    };

    const openEditModal = (meal: MealPlan) => {
        setEditingMeal(meal);
        setFoodName(meal.food.name);
        setMealType(meal.mealType || meal.name);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!foodName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập tên món ăn',
            });
            return;
        }

        try {
            if (editingMeal) {
                // Update existing meal
                await mealPlanApi.update({
                    planId: editingMeal._id,
                    newFoodName: foodName.trim(),
                    newName: mealType,
                });
                Toast.show({
                    type: 'success',
                    text1: 'Thành công!',
                    text2: 'Đã cập nhật kế hoạch bữa ăn',
                });
            } else {
                // Create new meal
                await mealPlanApi.create({
                    foodName: foodName.trim(),
                    timestamp: selectedDate.toISOString(),
                    name: mealType,
                });
                Toast.show({
                    type: 'success',
                    text1: 'Thành công!',
                    text2: 'Đã thêm kế hoạch bữa ăn',
                });
            }
            setModalVisible(false);
            setFoodName('');
            setEditingMeal(null);
            loadMeals();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể lưu',
            });
        }
    };

    const handleDelete = async (meal: MealPlan) => {
        try {
            await mealPlanApi.delete(meal._id);
            loadMeals();
            Toast.show({
                type: 'success',
                text1: 'Đã xóa!',
                text2: `Đã xóa "${meal.food.name}" khỏi kế hoạch`,
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xóa',
            });
        }
    };

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const formatDate = (date: Date) => {
        const today = getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.getTime() === today.getTime()) {
            return 'Hôm nay';
        } else if (date.getTime() === tomorrow.getTime()) {
            return 'Ngày mai';
        } else if (date.getTime() === yesterday.getTime()) {
            return 'Hôm qua';
        }

        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    const getMealLabel = (type: string) => {
        switch (type) {
            case 'sáng': return 'Buổi sáng';
            case 'trưa': return 'Buổi trưa';
            case 'tối': return 'Buổi tối';
            default: return type;
        }
    };

    const renderMealItem = ({ item }: { item: MealPlan }) => {
        const mealTime = item.mealType || item.name;
        return (
            <TouchableOpacity
                style={styles.mealCard}
                onPress={() => openEditModal(item)}
                onLongPress={() => handleDelete(item)}
            >
                <View style={styles.mealBadge}>
                    <Text style={styles.mealBadgeText}>{getMealLabel(mealTime)}</Text>
                </View>
                <View style={styles.mealInfo}>
                    <Text style={styles.mealFood}>{item.food.name}</Text>
                </View>
                <Text style={styles.editHint}>✏️</Text>
            </TouchableOpacity>
        );
    };

    const MealTypeButton = ({ type, label }: { type: 'sáng' | 'trưa' | 'tối'; label: string }) => (
        <TouchableOpacity
            style={[styles.typeBtn, mealType === type && styles.typeBtnActive]}
            onPress={() => setMealType(type)}
        >
            <Text style={[styles.typeText, mealType === type && styles.typeTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}> Kế hoạch bữa ăn</Text>
            </View>

            {/* Date Selector */}
            <View style={styles.dateSelector}>
                <TouchableOpacity style={styles.dateBtn} onPress={() => changeDate(-1)}>
                    <Text style={styles.dateBtnText}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                <TouchableOpacity style={styles.dateBtn} onPress={() => changeDate(1)}>
                    <Text style={styles.dateBtnText}>▶</Text>
                </TouchableOpacity>
            </View>

            {/* Meals List */}
            <FlatList
                data={meals}
                keyExtractor={(item) => item._id}
                renderItem={renderMealItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.mealsList}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}></Text>
                        <Text style={styles.emptyText}>Chưa có kế hoạch bữa ăn</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingMeal ? 'Sửa món ăn' : 'Thêm món ăn'}
                        </Text>

                        <View style={styles.typeSelector}>
                            <MealTypeButton type="sáng" label="Sáng" />
                            <MealTypeButton type="trưa" label="Trưa" />
                            <MealTypeButton type="tối" label="Tối" />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Tên món ăn *"
                            value={foodName}
                            onChangeText={setFoodName}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handleSave}>
                                <Text style={styles.addBtnText}>
                                    {editingMeal ? 'Lưu' : 'Thêm'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#e17055',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dateBtn: {
        padding: 8,
    },
    dateBtnText: {
        fontSize: 20,
        color: '#e17055',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
        textTransform: 'capitalize',
    },
    mealsList: {
        padding: 16,
        paddingBottom: 80,
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    mealIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    mealInfo: {
        flex: 1,
    },
    mealType: {
        fontSize: 14,
        color: '#636e72',
        textTransform: 'capitalize',
    },
    mealFood: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3436',
        marginTop: 4,
    },
    editHint: {
        fontSize: 18,
        color: '#b2bec3',
    },
    empty: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#636e72',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#e17055',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#e17055',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 28,
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 20,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    typeBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f1f3f4',
        alignItems: 'center',
    },
    typeBtnActive: {
        backgroundColor: '#e17055',
    },
    typeText: {
        fontWeight: '600',
        color: '#636e72',
    },
    typeTextActive: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#f1f3f4',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    modalBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#f1f3f4',
    },
    cancelText: {
        color: '#636e72',
        fontWeight: '600',
    },
    addBtn: {
        backgroundColor: '#e17055',
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    mealBadge: {
        backgroundColor: '#e17055',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 12,
    },
    mealBadgeText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
});

export default MealPlanScreen;
