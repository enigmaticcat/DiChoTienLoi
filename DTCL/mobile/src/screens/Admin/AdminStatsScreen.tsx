import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Alert,
    Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { adminApi } from '../../services/api';

interface Props {
    navigation: any;
}

interface Stats {
    users: {
        total: number;
        admins: number;
        verified: number;
    };
    groups: number;
    categories: number;
    units: number;
}

interface Category {
    _id: string;
    name: string;
}

interface Unit {
    _id: string;
    name: string;
}

const AdminStatsScreen: React.FC<Props> = ({ navigation }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [newUnit, setNewUnit] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([loadStats(), loadCategories(), loadUnits()]);
    };

    const loadStats = async () => {
        try {
            const res = await adminApi.getStats();
            setStats(res.data.data);
        } catch (error) {
            console.error('Load stats error:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await adminApi.getCategories();
            setCategories(res.data.data || []);
        } catch (error) {
            console.error('Load categories error:', error);
        }
    };

    const loadUnits = async () => {
        try {
            const res = await adminApi.getUnits();
            setUnits(res.data.data || []);
        } catch (error) {
            console.error('Load units error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            await adminApi.createCategory(newCategory.trim());
            setNewCategory('');
            await loadCategories();
            await loadStats();
            Toast.show({ type: 'success', text1: 'Đã thêm danh mục!' });
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: error.response?.data?.message });
        }
    };

    const handleDeleteCategory = async (name: string) => {
        const doDelete = async () => {
            try {
                await adminApi.deleteCategory(name);
                await loadCategories();
                await loadStats();
                Toast.show({ type: 'success', text1: 'Đã xóa danh mục!' });
            } catch (error: any) {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: error.response?.data?.message });
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Xóa danh mục "${name}"?`)) doDelete();
        } else {
            Alert.alert('Xóa danh mục', `Bạn có chắc muốn xóa "${name}"?`, [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const handleAddUnit = async () => {
        if (!newUnit.trim()) return;
        try {
            await adminApi.createUnit(newUnit.trim());
            setNewUnit('');
            await loadUnits();
            await loadStats();
            Toast.show({ type: 'success', text1: 'Đã thêm đơn vị!' });
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: error.response?.data?.message });
        }
    };

    const handleDeleteUnit = async (name: string) => {
        const doDelete = async () => {
            try {
                await adminApi.deleteUnit(name);
                await loadUnits();
                await loadStats();
                Toast.show({ type: 'success', text1: 'Đã xóa đơn vị!' });
            } catch (error: any) {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: error.response?.data?.message });
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Xóa đơn vị "${name}"?`)) doDelete();
        } else {
            Alert.alert('Xóa đơn vị', `Bạn có chắc muốn xóa "${name}"?`, [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const StatCard = ({ icon, title, value, color }: any) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View style={styles.statInfo}>
                <Text style={styles.statTitle}>{title}</Text>
                <Text style={[styles.statValue, { color }]}>{value ?? '...'}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.title}>⚙️ Quản trị hệ thống</Text>
            </View>

            <View style={styles.statsGrid}>
                <StatCard icon="👥" title="Tổng người dùng" value={stats?.users?.total} color="#6c5ce7" />
                <StatCard icon="✅" title="Đã xác minh" value={stats?.users?.verified} color="#00b894" />
                <StatCard icon="🛡️" title="Admin" value={stats?.users?.admins} color="#fdcb6e" />
                <StatCard icon="🏠" title="Nhóm gia đình" value={stats?.groups} color="#0984e3" />
            </View>

            {/* Category Management */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📁 Quản lý danh mục ({categories.length})</Text>
                <View style={styles.addRow}>
                    <TextInput
                        style={styles.addInput}
                        placeholder="Tên danh mục mới..."
                        value={newCategory}
                        onChangeText={setNewCategory}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory}>
                        <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemList}>
                    {categories.map((cat) => (
                        <View key={cat._id} style={styles.itemRow}>
                            <Text style={styles.itemName}>{cat.name}</Text>
                            <TouchableOpacity onPress={() => handleDeleteCategory(cat.name)}>
                                <Text style={styles.deleteBtn}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Unit Management */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📏 Quản lý đơn vị ({units.length})</Text>
                <View style={styles.addRow}>
                    <TextInput
                        style={styles.addInput}
                        placeholder="Tên đơn vị mới (ví dụ: kg, lít, quả)..."
                        value={newUnit}
                        onChangeText={setNewUnit}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddUnit}>
                        <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemList}>
                    {units.map((u) => (
                        <View key={u._id} style={styles.itemRow}>
                            <Text style={styles.itemName}>{u.name}</Text>
                            <TouchableOpacity onPress={() => handleDeleteUnit(u.name)}>
                                <Text style={styles.deleteBtn}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚀 Quản lý nhanh</Text>
                <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => navigation.navigate('UserManagement')}
                >
                    <Text style={styles.quickIcon}>👥</Text>
                    <Text style={styles.quickText}>Quản lý người dùng</Text>
                    <Text style={styles.quickArrow}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 60,
    },
    header: {
        backgroundColor: '#2d3436',
        padding: 20,
        paddingTop: 60,
    },
    backBtn: {
        color: '#fdcb6e',
        fontSize: 16,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsGrid: {
        padding: 16,
        gap: 12,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 4,
    },
    statIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    statInfo: {
        flex: 1,
    },
    statTitle: {
        fontSize: 14,
        color: '#636e72',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 4,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 12,
    },
    addRow: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    addInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#dfe6e9',
    },
    addBtn: {
        backgroundColor: '#00b894',
        borderRadius: 12,
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    itemList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        color: '#2d3436',
    },
    deleteBtn: {
        fontSize: 18,
        padding: 4,
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    quickIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    quickText: {
        flex: 1,
        fontSize: 16,
        color: '#2d3436',
    },
    quickArrow: {
        fontSize: 20,
        color: '#b2bec3',
    },
});

export default AdminStatsScreen;
