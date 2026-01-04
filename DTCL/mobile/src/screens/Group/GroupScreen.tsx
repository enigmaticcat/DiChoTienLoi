import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { groupApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
    navigation: any;
}

interface Member {
    _id: string;
    name: string;
    email: string;
    username?: string;
}

const GroupScreen: React.FC<Props> = ({ navigation }) => {
    const { user, refreshUser } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [hasGroup, setHasGroup] = useState(!!user?.group);

    useEffect(() => {
        if (hasGroup) {
            loadMembers();
        }
    }, [hasGroup]);

    const loadMembers = async () => {
        try {
            const res = await groupApi.getMembers();
            // API returns { data: { members: [...] } }
            setMembers(res.data.data?.members || []);
        } catch (error) {
            console.error('Load members error:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadMembers();
        setRefreshing(false);
    }, []);

    const handleCreateGroup = async () => {
        try {
            await groupApi.create();
            await refreshUser();
            setHasGroup(true);
            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Đã tạo nhóm gia đình',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể tạo nhóm',
            });
        }
    };

    const handleAddMember = async () => {
        if (!username.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập username',
            });
            return;
        }

        try {
            await groupApi.addMember(username.trim());
            setModalVisible(false);
            setUsername('');
            loadMembers();
            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Đã thêm thành viên',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể thêm',
            });
        }
    };

    const handleRemoveMember = async (member: Member) => {
        if (member._id === user?.id) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xóa chính mình',
            });
            return;
        }

        try {
            await groupApi.removeMember(member.username || member.email);
            loadMembers();
            Toast.show({
                type: 'success',
                text1: 'Đã xóa!',
                text2: `Đã xóa ${member.name} khỏi nhóm`,
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể xóa',
            });
        }
    };

    const handleLeaveGroup = async () => {
        try {
            await groupApi.leaveGroup();
            await refreshUser();
            setHasGroup(false);
            Toast.show({
                type: 'success',
                text1: 'Đã rời nhóm!',
                text2: 'Bạn đã rời khỏi nhóm gia đình',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể rời nhóm',
            });
        }
    };

    const handleDeleteGroup = () => {
        Alert.alert(
            'Xóa nhóm',
            'Bạn có chắc muốn xóa nhóm? Tất cả thành viên sẽ bị loại khỏi nhóm.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await groupApi.deleteGroup();
                            await refreshUser();
                            setHasGroup(false);
                            Toast.show({
                                type: 'success',
                                text1: 'Đã xóa nhóm!',
                                text2: 'Nhóm đã được xóa',
                            });
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Lỗi',
                                text2: error.response?.data?.message || 'Không thể xóa nhóm',
                            });
                        }
                    },
                },
            ]
        );
    };

    const renderMember = ({ item }: { item: Member }) => (
        <View style={styles.memberCard}>
            <View style={styles.memberAvatar}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberEmail}>{item.email}</Text>
            </View>
            {item._id !== user?.id && (
                <TouchableOpacity onPress={() => handleRemoveMember(item)}>
                    <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (!hasGroup) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtn}>← Quay lại</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}> Nhóm gia đình</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}></Text>
                    <Text style={styles.emptyTitle}>Chưa có nhóm</Text>
                    <Text style={styles.emptyText}>
                        Tạo nhóm gia đình để cùng quản lý tủ lạnh và danh sách mua sắm
                    </Text>
                    <TouchableOpacity style={styles.createBtn} onPress={handleCreateGroup}>
                        <Text style={styles.createBtnText}>+ Tạo nhóm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.title}> Nhóm gia đình</Text>
                <Text style={styles.subtitle}>{members.length} thành viên</Text>
            </View>

            <FlatList
                data={members}
                keyExtractor={(item) => item._id}
                renderItem={renderMember}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyListText}>Chưa có thành viên nào</Text>
                }
                ListFooterComponent={
                    <View>
                        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveGroup}>
                            <Text style={styles.leaveBtnText}>Rời khỏi nhóm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteGroupBtn} onPress={handleDeleteGroup}>
                            <Text style={styles.deleteGroupBtnText}>Xóa nhóm (Chỉ trưởng nhóm)</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm thành viên</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Username hoặc email"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.addBtn]} onPress={handleAddMember}>
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
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#00b894',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    memberInfo: {
        flex: 1,
        marginLeft: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
    },
    memberEmail: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
    },
    removeBtn: {
        fontSize: 20,
        color: '#d63031',
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#636e72',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyListText: {
        textAlign: 'center',
        color: '#636e72',
        paddingTop: 40,
    },
    createBtn: {
        backgroundColor: '#00b894',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    createBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
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
    leaveBtn: {
        marginTop: 20,
        marginBottom: 40,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d63031',
    },
    leaveBtnText: {
        color: '#d63031',
        fontWeight: '600',
        fontSize: 16,
    },
    deleteGroupBtn: {
        marginBottom: 40,
        padding: 16,
        backgroundColor: '#d63031',
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteGroupBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default GroupScreen;
