import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { userApi } from '../../services/api';

interface Props {
    navigation: any;
}

const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng điền đầy đủ thông tin',
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Mật khẩu mới phải có ít nhất 6 ký tự',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Mật khẩu xác nhận không khớp',
            });
            return;
        }

        setLoading(true);
        try {
            await userApi.changePassword({ oldPassword, newPassword });
            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Đã đổi mật khẩu',
            });
            navigation.goBack();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể đổi mật khẩu',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Đổi mật khẩu</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Mật khẩu hiện tại</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu hiện tại"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry
                />

                <Text style={styles.label}>Mật khẩu mới</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                />

                <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    <Text style={styles.submitBtnText}>
                        {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Text>
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
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#dfe6e9',
    },
    submitBtn: {
        backgroundColor: '#00b894',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 32,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangePasswordScreen;
