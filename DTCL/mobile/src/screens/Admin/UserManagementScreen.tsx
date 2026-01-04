import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { adminApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
    navigation: any;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
}

const UserManagementScreen: React.FC<Props> = ({ navigation }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async (searchTerm?: string) => {
        try {
            const res = await adminApi.getUsers({ search: searchTerm, limit: 50 });
            setUsers(res.data.data?.users || []);
        } catch (error) {
            console.error('Load users error:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUsers(search);
        setRefreshing(false);
    }, [search]);

    const handleSearch = () => {
        loadUsers(search);
    };

    const handleDeleteUser = (user: User) => {
        if (user._id === currentUser?.id) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xóa chính mình',
            });
            return;
        }

        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa người dùng "${user.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminApi.deleteUser(user._id);
                            loadUsers(search);
                            Toast.show({
                                type: 'success',
                                text1: 'Đã xóa!',
                                text2: `Đã xóa người dùng ${user.name}`,
                            });
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Lỗi',
                                text2: error.response?.data?.message || 'Không thể xóa',
                            });
                        }
                    },
                },
            ]
        );
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return { text: 'Admin', color: '#fdcb6e' };
            case 'groupAdmin':
                return { text: 'Trưởng nhóm', color: '#00b894' };
            default:
                return { text: 'Thành viên', color: '#636e72' };
        }
    };

    const renderUser = ({ item }: { item: User }) => {
        const badge = getRoleBadge(item.role);
        const isCurrentUser = item._id === currentUser?.id;
        return (
            <View style={styles.userCard}>
                <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <View style={styles.userHeader}>
                        <Text style={styles.userName}>{item.name}</Text>
                        {!item.isVerified && (
                            <Text style={styles.notVerified}>(Chưa xác minh)</Text>
                        )}
                    </View>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: badge.color + '20' }]}>
                        <Text style={[styles.roleText, { color: badge.color }]}>{badge.text}</Text>
                    </View>
                </View>
                {!isCurrentUser && (
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteUser(item)}
                    >
                        <Text style={styles.deleteBtnText}>X</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Quản lý người dùng</Text>
                <Text style={styles.subtitle}>{users.length} người dùng</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                    <Text style={styles.searchBtnText}>Tìm</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => item._id}
                renderItem={renderUser}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
                }
            />
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
    backBtn: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        marginBottom: 8,
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
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    searchBtn: {
        backgroundColor: '#6c5ce7',
        borderRadius: 12,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBtnText: {
        fontSize: 20,
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    userCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6c5ce7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
    },
    notVerified: {
        marginLeft: 6,
        fontSize: 12,
    },
    userEmail: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: '#636e72',
        paddingTop: 40,
    },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d63031',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    deleteBtnText: {
        color: '#d63031',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default UserManagementScreen;
