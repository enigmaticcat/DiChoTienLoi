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
} from 'react-native';
import Toast from 'react-native-toast-message';
import { recipeApi } from '../../services/api';

interface Recipe {
    _id: string;
    name: string;
    food: { name: string };
    description?: string;
    htmlContent?: string;
}

const RecipeScreen: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [foodName, setFoodName] = useState('');
    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async () => {
        try {
            const res = await recipeApi.getAll();
            setRecipes(res.data.data || []);
        } catch (error) {
            console.error('Load recipes error:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadRecipes();
        setRefreshing(false);
    }, []);

    const openAddModal = () => {
        setEditingRecipe(null);
        setFoodName('');
        setRecipeName('');
        setDescription('');
        setModalVisible(true);
    };

    const openEditModal = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        setFoodName(recipe.food.name);
        setRecipeName(recipe.name);
        setDescription(recipe.description || '');
        setDetailModalVisible(false);
        setModalVisible(true);
    };

    const handleSaveRecipe = async () => {
        if (!foodName.trim() || !recipeName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập tên món và tên công thức',
            });
            return;
        }

        try {
            if (editingRecipe) {
                await recipeApi.update({
                    recipeId: editingRecipe._id,
                    newName: recipeName.trim(),
                    newDescription: description.trim() || undefined,
                });
                Toast.show({
                    type: 'success',
                    text1: 'Thành công!',
                    text2: 'Đã cập nhật công thức',
                });
            } else {
                await recipeApi.create({
                    foodName: foodName.trim(),
                    name: recipeName.trim(),
                    description: description.trim() || undefined,
                });
                Toast.show({
                    type: 'success',
                    text1: 'Thành công!',
                    text2: 'Đã thêm công thức',
                });
            }
            setModalVisible(false);
            setFoodName('');
            setRecipeName('');
            setDescription('');
            setEditingRecipe(null);
            loadRecipes();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể lưu',
            });
        }
    };

    const handleDeleteRecipe = async (recipe: Recipe) => {
        try {
            await recipeApi.delete(recipe._id);
            loadRecipes();
            Toast.show({
                type: 'success',
                text1: 'Đã xóa!',
                text2: `Đã xóa công thức "${recipe.name}"`,
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xóa',
            });
        }
    };

    const handleViewRecipe = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setDetailModalVisible(true);
    };

    const renderRecipe = ({ item }: { item: Recipe }) => (
        <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => handleViewRecipe(item)}
            onLongPress={() => handleDeleteRecipe(item)}
        >
            <View style={styles.recipeIcon}>
                <Text style={styles.recipeIconText}>📖</Text>
            </View>
            <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <Text style={styles.recipeFood}>Món: {item.food?.name}</Text>
                {item.description && (
                    <Text style={styles.recipeDesc} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const getFilteredRecipes = () => {
        if (!searchQuery.trim()) return recipes;
        return recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.food?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredRecipes = getFilteredRecipes();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Công thức nấu ăn</Text>
                <Text style={styles.subtitle}>{filteredRecipes.length} / {recipes.length} công thức</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Tìm công thức hoặc món ăn..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item._id}
                renderItem={renderRecipe}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📖</Text>
                        <Text style={styles.emptyText}>Chưa có công thức nào</Text>
                        <Text style={styles.emptyHint}>Nhấn + để thêm công thức mới</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Add/Edit Recipe Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingRecipe ? 'Sửa công thức' : 'Thêm công thức'}
                        </Text>

                        <TextInput
                            style={[styles.input, editingRecipe && styles.inputDisabled]}
                            placeholder="Tên món ăn *"
                            value={foodName}
                            onChangeText={setFoodName}
                            editable={!editingRecipe}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Tên công thức *"
                            value={recipeName}
                            onChangeText={setRecipeName}
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Mô tả / Cách làm"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handleSaveRecipe}>
                                <Text style={styles.addBtnText}>
                                    {editingRecipe ? 'Lưu' : 'Thêm'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Recipe Detail Modal */}
            <Modal visible={detailModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.detailModalContent}>
                        <ScrollView>
                            <Text style={styles.detailTitle}>{selectedRecipe?.name}</Text>
                            <Text style={styles.detailFood}>Món: {selectedRecipe?.food?.name}</Text>
                            {selectedRecipe?.description && (
                                <Text style={styles.detailDesc}>{selectedRecipe.description}</Text>
                            )}
                        </ScrollView>
                        <View style={styles.detailButtonsRow}>
                            <TouchableOpacity
                                style={styles.editDetailBtn}
                                onPress={() => selectedRecipe && openEditModal(selectedRecipe)}
                            >
                                <Text style={styles.editDetailBtnText}>✏️ Sửa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setDetailModalVisible(false)}
                            >
                                <Text style={styles.closeBtnText}>Đóng</Text>
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
        backgroundColor: '#0984e3',
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
    recipeCard: {
        flexDirection: 'row',
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
    recipeIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#0984e3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recipeIconText: {
        fontSize: 24,
    },
    recipeInfo: {
        flex: 1,
        marginLeft: 12,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
    },
    recipeFood: {
        fontSize: 12,
        color: '#0984e3',
        marginTop: 2,
    },
    recipeDesc: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 4,
    },
    empty: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
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
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0984e3',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0984e3',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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
        backgroundColor: '#0984e3',
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    detailModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
    },
    detailFood: {
        fontSize: 14,
        color: '#0984e3',
        marginBottom: 16,
    },
    detailDesc: {
        fontSize: 16,
        color: '#2d3436',
        lineHeight: 24,
    },
    closeBtn: {
        backgroundColor: '#f1f3f4',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    closeBtnText: {
        color: '#636e72',
        fontWeight: '600',
    },
    inputDisabled: {
        backgroundColor: '#e0e0e0',
        color: '#888',
    },
    detailButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    editDetailBtn: {
        flex: 1,
        backgroundColor: '#0984e3',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    editDetailBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    searchContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        backgroundColor: '#f1f3f4',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
});

export default RecipeScreen;
