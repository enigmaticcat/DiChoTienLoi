import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

interface Props {
    navigation: any;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        Toast.show({
            type: 'success',
            text1: 'Đăng xuất thành công!',
            text2: 'Hẹn gặp lại bạn',
        });
    };

    const MenuItem = ({ icon, title, onPress, danger }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Text style={styles.menuIcon}>{icon}</Text>
            <Text style={[styles.menuTitle, danger && styles.menuDanger]}>{title}</Text>
            <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <Text style={styles.name}>{user?.name || 'Người dùng'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {user?.role === 'admin' && (
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminText}> Admin</Text>
                    </View>
                )}
            </View>

            {/* Tài khoản */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tài khoản</Text>
                <MenuItem
                    icon=""
                    title="Chỉnh sửa hồ sơ"
                    onPress={() => navigation.navigate('EditProfile')}
                />
                <MenuItem
                    icon=""
                    title="Đổi mật khẩu"
                    onPress={() => navigation.navigate('ChangePassword')}
                />
            </View>

            {/* Gia đình */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gia đình</Text>
                <MenuItem
                    icon=""
                    title="Quản lý nhóm"
                    onPress={() => navigation.navigate('Group')}
                />
            </View>

            {/* Cài đặt */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cài đặt</Text>
                <MenuItem
                    icon=""
                    title="Thông báo"
                    onPress={() => Toast.show({ type: 'success', text1: 'Đã bật thông báo', text2: 'Bạn sẽ nhận được nhắc nhở hết hạn' })}
                />
            </View>

            {/* Admin Section */}
            {user?.role === 'admin' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quản trị</Text>
                    <MenuItem
                        icon=""
                        title="Thống kê hệ thống"
                        onPress={() => navigation.navigate('AdminStats')}
                    />
                    <MenuItem
                        icon=""
                        title="Quản lý người dùng"
                        onPress={() => navigation.navigate('UserManagement')}
                    />
                </View>
            )}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}> Đăng xuất</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Đi Chợ Tiện Lợi v1.0.0</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#2d3436',
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#00b894',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    email: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    adminBadge: {
        backgroundColor: 'rgba(253, 203, 110, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 12,
    },
    adminText: {
        color: '#fdcb6e',
        fontWeight: '600',
        fontSize: 12,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#636e72',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        color: '#2d3436',
    },
    menuDanger: {
        color: '#d63031',
    },
    menuArrow: {
        fontSize: 20,
        color: '#b2bec3',
    },
    logoutBtn: {
        backgroundColor: '#fff',
        marginTop: 16,
        padding: 16,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#d63031',
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        color: '#b2bec3',
        fontSize: 12,
        marginVertical: 24,
    },
});

export default ProfileScreen;
