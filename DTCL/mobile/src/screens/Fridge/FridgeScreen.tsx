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
    Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { fridgeApi, foodApi } from '../../services/api';

interface FridgeItem {
    _id: string;
    food: { _id: string; name: string; category?: { name: string }; image?: string };
    quantity: number;
    unit?: { name: string };
    expiryDate: string;
    note?: string;
}

const FridgeScreen: React.FC = () => {
    const [items, setItems] = useState<FridgeItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [foodName, setFoodName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [useWithin, setUseWithin] = useState('7');
    const [note, setNote] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const res = await fridgeApi.getAll();
            setItems(res.data.data || []);
        } catch (error) {
            console.error('Load fridge error:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadItems();
        setRefreshing(false);
    }, []);

    const handleAdd = async () => {
        if (!foodName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập tên thực phẩm',
            });
            return;
        }

        try {
            await fridgeApi.create({
                foodName: foodName.trim(),
                quantity: parseInt(quantity) || 1,
                useWithin: parseInt(useWithin) || 7,
                note: note.trim() || undefined,
                image: imageUrl.trim() || undefined,
            });
            setModalVisible(false);
            setFoodName('');
            setQuantity('1');
            setUseWithin('7');
            setNote('');
            setImageUrl('');
            loadItems();
            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Đã thêm vào tủ lạnh',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể thêm',
            });
        }
    };

    const handleDelete = async (item: FridgeItem) => {
        try {
            await fridgeApi.delete(item._id);
            loadItems();
            Toast.show({
                type: 'success',
                text1: 'Đã xóa!',
                text2: `Đã xóa "${item.food.name}" khỏi tủ lạnh`,
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xóa',
            });
        }
    };

    const getDaysLeft = (expiryDate: string) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getExpiryColor = (daysLeft: number) => {
        if (daysLeft <= 0) return '#d63031';
        if (daysLeft <= 3) return '#e17055';
        if (daysLeft <= 7) return '#fdcb6e';
        return '#00b894';
    };

    const renderItem = ({ item }: { item: FridgeItem }) => {
        const daysLeft = getDaysLeft(item.expiryDate);
        const expiryColor = getExpiryColor(daysLeft);

        return (
            <TouchableOpacity
                style={styles.itemCard}
                onLongPress={() => handleDelete(item)}
            >
                <View style={styles.itemLeft}>
                    {item.food.image ? (
                        <Image source={{ uri: item.food.image }} style={styles.foodImage} />
                    ) : (
                        <View style={styles.foodPlaceholder}>
                            <Text style={styles.placeholderText}>{item.food.name[0]?.toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={styles.textContainer}>
                        <Text style={styles.itemName}>{item.food.name}</Text>
                        <Text style={styles.itemCategory}>
                            {item.food.category?.name || 'Khác'} • {item.quantity} {item.unit?.name || ''}
                        </Text>
                        {item.note && <Text style={styles.itemNote}>{item.note}</Text>}
                    </View>
                </View>
                <View style={[styles.expiryBadge, { backgroundColor: expiryColor }]}>
                    <Text style={styles.expiryText}>
                        {daysLeft <= 0 ? 'Hết hạn' : `${daysLeft} ngày`}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}> Tủ lạnh</Text>
                <Text style={styles.subtitle}>{items.length} món</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>🥡</Text>
                        <Text style={styles.emptyText}>Tủ lạnh trống</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Add Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm vào tủ lạnh</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Tên thực phẩm *"
                            value={foodName}
                            onChangeText={setFoodName}
                        />

                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="Số lượng"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="number-pad"
                            />
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="Dùng trong (ngày)"
                                value={useWithin}
                                onChangeText={setUseWithin}
                                keyboardType="number-pad"
                            />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Ghi chú"
                            value={note}
                            onChangeText={setNote}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Link ảnh (tùy chọn)"
                            value={imageUrl}
                            onChangeText={setImageUrl}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handleAdd}>
                                <Text style={styles.addBtnText}>Thêm</Text>
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
        backgroundColor: '#00b894',
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
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    itemLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
    },
    foodPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#dfe6e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#636e72',
    },
    textContainer: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
    },
    itemCategory: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 4,
    },
    itemNote: {
        fontSize: 12,
        color: '#b2bec3',
        marginTop: 4,
        fontStyle: 'italic',
    },
    expiryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    expiryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
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
        backgroundColor: '#00b894',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00b894',
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
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
        backgroundColor: '#00b894',
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default FridgeScreen;
