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
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { shoppingApi, groupApi } from '../../services/api';

interface Member {
    _id: string;
    name: string;
    email: string;
}

interface ShoppingTask {
    _id: string;
    food: { name: string };
    quantity: number;
    unit?: { name: string };
    isCompleted: boolean;
    assignedTo?: { _id: string; name: string };
    price?: number;
}

interface ShoppingList {
    _id: string;
    name?: string;
    date: string;
    tasks?: ShoppingTask[];
}

const ShoppingScreen: React.FC = () => {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
    const [tasks, setTasks] = useState<ShoppingTask[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [editingTask, setEditingTask] = useState<ShoppingTask | null>(null);
    const [price, setPrice] = useState('');
    const [listModalVisible, setListModalVisible] = useState(false);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        loadLists();
        loadMembers();
    }, []);

    const loadLists = async () => {
        try {
            const res = await shoppingApi.getLists();
            setLists(res.data.data || []);
        } catch (error) {
            console.error('Load lists error:', error);
        }
    };

    const loadMembers = async () => {
        try {
            const res = await groupApi.getMembers();
            setMembers(res.data.data?.members || []);
        } catch (error) {
            console.error('Load members error:', error);
        }
    };

    const loadTasks = async (listId: string) => {
        try {
            const res = await shoppingApi.getTasks(listId);
            setTasks(res.data.data || []);
        } catch (error) {
            console.error('Load tasks error:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadLists();
        await loadMembers();
        if (selectedList) {
            await loadTasks(selectedList._id);
        }
        setRefreshing(false);
    }, [selectedList]);

    const handleCreateList = async () => {
        try {
            await shoppingApi.createList(newListName ? { name: newListName } : undefined);
            setListModalVisible(false);
            setNewListName('');
            loadLists();
            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Đã tạo danh sách mới',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể tạo danh sách',
            });
        }
    };

    const handleSelectList = (list: ShoppingList) => {
        setSelectedList(list);
        loadTasks(list._id);
    };

    const openAddModal = () => {
        setEditingTask(null);
        setFoodName('');
        setQuantity('1');
        setSelectedMember('');
        setPrice('');
        setModalVisible(true);
    };

    const openEditModal = (task: ShoppingTask) => {
        setEditingTask(task);
        setFoodName(task.food.name);
        setQuantity(String(task.quantity));
        setSelectedMember(task.assignedTo?._id || '');
        setPrice(task.price ? String(task.price) : '');
        setModalVisible(true);
    };

    const handleSaveTask = async () => {
        if (!selectedList || !foodName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập tên thực phẩm',
            });
            return;
        }

        try {
            if (editingTask) {
                await shoppingApi.updateTask({
                    taskId: editingTask._id,
                    newFoodName: foodName.trim(),
                    newQuantity: parseInt(quantity) || 1,
                    newPrice: price ? parseFloat(price) : undefined,
                });
                Toast.show({
                    type: 'success',
                    text1: 'Thành công!',
                    text2: 'Đã cập nhật món cần mua',
                });
            } else {
                await shoppingApi.createTask({
                    listId: selectedList._id,
                    foodName: foodName.trim(),
                    quantity: parseInt(quantity) || 1,
                    assignedTo: selectedMember || undefined,
                    price: price ? parseFloat(price) : undefined,
                });
                Toast.show({
                    type: 'success',
                    text1: 'Thành công!',
                    text2: 'Đã thêm món cần mua',
                });
            }
            setModalVisible(false);
            setFoodName('');
            setQuantity('1');
            setSelectedMember('');
            setEditingTask(null);
            loadTasks(selectedList._id);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể lưu',
            });
        }
    };

    const handleToggleTask = async (task: ShoppingTask) => {
        try {
            await shoppingApi.updateTask({
                taskId: task._id,
                isCompleted: !task.isCompleted,
            });
            loadTasks(selectedList!._id);
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
    };

    const handleDeleteTask = async (task: ShoppingTask) => {
        const doDelete = async () => {
            try {
                await shoppingApi.deleteTask(task._id);
                if (selectedList) {
                    loadTasks(selectedList._id);
                }
                Toast.show({ type: 'success', text1: 'Đã xóa!' });
            } catch (error: any) {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: error.response?.data?.message });
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Xóa "${task.food.name}"?`)) doDelete();
        } else {
            Alert.alert('Xóa món', `Bạn có chắc muốn xóa "${task.food.name}"?`, [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const renderListItem = ({ item }: { item: ShoppingList }) => (
        <TouchableOpacity
            style={[styles.listCard, selectedList?._id === item._id && styles.listCardActive]}
            onPress={() => handleSelectList(item)}
        >
            <Text style={[styles.listName, selectedList?._id === item._id && styles.listDateActive]}>
                {item.name || formatDate(item.date)}
            </Text>
            {item.name ? (
                <Text style={styles.listDateSmall}>{formatDate(item.date)}</Text>
            ) : null}
        </TouchableOpacity>
    );

    const renderTaskItem = ({ item }: { item: ShoppingTask }) => (
        <TouchableOpacity
            style={[styles.taskCard, item.isCompleted && styles.taskCompleted]}
            onPress={() => handleToggleTask(item)}
            onLongPress={() => openEditModal(item)}
        >
            <View style={[styles.checkbox, item.isCompleted && styles.checkboxChecked]}>
                {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.taskInfo}>
                <Text style={[styles.taskName, item.isCompleted && styles.taskNameDone]}>
                    {item.food.name}
                </Text>
                <Text style={styles.taskQuantity}>
                    SL: {item.quantity} {item.unit?.name || ''}
                </Text>
                {item.assignedTo && (
                    <View style={styles.assignedBadge}>
                        <Text style={styles.assignedText}>
                            Phân công: {item.assignedTo.name}
                        </Text>
                    </View>
                )}
            </View>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editTaskBtn}>
                <Text style={styles.editTaskIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item)} style={styles.deleteTaskBtn}>
                <Text style={styles.deleteTaskIcon}>🗑️</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Danh sách mua sắm</Text>
                <Text style={styles.subtitle}>Chia sẻ với nhóm gia đình</Text>
            </View>

            {/* Date Tabs */}
            <View style={styles.listsContainer}>
                <FlatList
                    horizontal
                    data={lists}
                    keyExtractor={(item) => item._id}
                    renderItem={renderListItem}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listsTabs}
                    ListHeaderComponent={
                        <TouchableOpacity style={styles.addListBtn} onPress={() => setListModalVisible(true)}>
                            <Text style={styles.addListText}>+ Mới</Text>
                        </TouchableOpacity>
                    }
                />
            </View>

            {/* Tasks */}
            {selectedList ? (
                <FlatList
                    data={tasks}
                    keyExtractor={(item) => item._id}
                    renderItem={renderTaskItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.tasksList}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>Chưa có món nào</Text>
                            <Text style={styles.emptyHint}>Nhấn + để thêm món cần mua</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chọn hoặc tạo danh sách mới</Text>
                </View>
            )}

            {/* FAB */}
            {selectedList && (
                <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}

            {/* Add Task Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm món cần mua</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Tên thực phẩm *"
                            value={foodName}
                            onChangeText={setFoodName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Số lượng"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="number-pad"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Giá tiền (VNĐ)"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />

                        {/* Member Assignment */}
                        <Text style={styles.inputLabel}>Phân công cho:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberScroll}>
                            <TouchableOpacity
                                style={[styles.memberChip, !selectedMember && styles.memberChipActive]}
                                onPress={() => setSelectedMember('')}
                            >
                                <Text style={[styles.memberChipText, !selectedMember && styles.memberChipTextActive]}>
                                    Không ai
                                </Text>
                            </TouchableOpacity>
                            {members.map((member) => (
                                <TouchableOpacity
                                    key={member._id}
                                    style={[styles.memberChip, selectedMember === member._id && styles.memberChipActive]}
                                    onPress={() => setSelectedMember(member._id)}
                                >
                                    <Text style={[styles.memberChipText, selectedMember === member._id && styles.memberChipTextActive]}>
                                        {member.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handleSaveTask}>
                                <Text style={styles.addBtnText}>
                                    {editingTask ? 'Lưu' : 'Thêm'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create List Modal */}
            <Modal visible={listModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Tạo danh sách mới</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tên danh sách (VD: Mua sắm cuối tuần)"
                            value={newListName}
                            onChangeText={setNewListName}
                        />
                        <Text style={styles.inputHint}>Để trống sẽ dùng ngày hiện tại</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => {
                                    setListModalVisible(false);
                                    setNewListName('');
                                }}
                            >
                                <Text style={styles.cancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handleCreateList}>
                                <Text style={styles.addBtnText}>Tạo</Text>
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
        backgroundColor: '#6c5ce7',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    listsContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listsTabs: {
        paddingHorizontal: 16,
        gap: 8,
    },
    addListBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#6c5ce7',
        borderStyle: 'dashed',
        marginRight: 8,
    },
    addListText: {
        color: '#6c5ce7',
        fontWeight: '600',
    },
    listCard: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f3f4',
        marginRight: 8,
    },
    listCardActive: {
        backgroundColor: '#6c5ce7',
    },
    listDate: {
        color: '#2d3436',
        fontWeight: '500',
    },
    listName: {
        color: '#2d3436',
        fontWeight: '600',
        fontSize: 14,
    },
    listDateSmall: {
        color: '#636e72',
        fontSize: 10,
        marginTop: 2,
    },
    listDateActive: {
        color: '#fff',
    },
    tasksList: {
        padding: 16,
        paddingBottom: 80,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
    taskCompleted: {
        opacity: 0.6,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#6c5ce7',
        marginRight: 12,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#6c5ce7',
    },
    checkmark: {
        color: '#fff',
        fontWeight: 'bold',
    },
    taskInfo: {
        flex: 1,
    },
    taskName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2d3436',
    },
    taskNameDone: {
        textDecorationLine: 'line-through',
    },
    taskQuantity: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 4,
    },
    assignedBadge: {
        backgroundColor: '#dfe6e9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    assignedText: {
        fontSize: 12,
        color: '#636e72',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#636e72',
    },
    emptyHint: {
        fontSize: 14,
        color: '#b2bec3',
        marginTop: 8,
    },
    inputHint: {
        fontSize: 12,
        color: '#b2bec3',
        marginTop: 4,
        marginBottom: 12,
    },
    editTaskBtn: {
        padding: 8,
    },
    editTaskIcon: {
        fontSize: 18,
    },
    deleteTaskBtn: {
        padding: 8,
    },
    deleteTaskIcon: {
        fontSize: 18,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6c5ce7',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6c5ce7',
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
    input: {
        backgroundColor: '#f1f3f4',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 8,
        fontWeight: '500',
    },
    memberScroll: {
        marginBottom: 16,
    },
    memberChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f3f4',
        marginRight: 8,
    },
    memberChipActive: {
        backgroundColor: '#6c5ce7',
    },
    memberChipText: {
        color: '#636e72',
        fontWeight: '500',
    },
    memberChipTextActive: {
        color: '#fff',
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
        backgroundColor: '#6c5ce7',
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    editHint: {
        fontSize: 18,
        color: '#b2bec3',
    },
});

export default ShoppingScreen;
