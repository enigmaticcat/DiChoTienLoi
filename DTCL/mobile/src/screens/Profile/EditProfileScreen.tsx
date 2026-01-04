import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';

interface Props {
    navigation: any;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, refreshUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || name.trim().length < 3) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Tên phải có ít nhất 3 ký tự',
            });
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            await userApi.updateProfile(formData);
            await refreshUser();
            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Đã cập nhật hồ sơ',
            });
            navigation.goBack();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể cập nhật',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
            </View>

            <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.changeAvatar}>Đổi ảnh đại diện</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ tên</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nhập họ tên"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        value={user?.email}
                        editable={false}
                    />
                    <Text style={styles.hint}>Email không thể thay đổi</Text>
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                    )}
                </TouchableOpacity>
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
        backgroundColor: '#2d3436',
        padding: 20,
        paddingTop: 60,
    },
    backBtn: {
        color: '#00b894',
        fontSize: 16,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    avatarSection: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#00b894',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    changeAvatar: {
        color: '#00b894',
        fontSize: 14,
        fontWeight: '600',
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputDisabled: {
        backgroundColor: '#f1f3f4',
        color: '#636e72',
    },
    hint: {
        fontSize: 12,
        color: '#b2bec3',
        marginTop: 4,
    },
    saveBtn: {
        backgroundColor: '#00b894',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
