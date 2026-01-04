import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { authApi } from '../../services/api';

interface Props {
    navigation: any;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email.trim()) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập email' });
            return;
        }

        setLoading(true);
        try {
            await authApi.forgotPassword(email.trim());
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Mã xác nhận đã được gửi đến email của bạn.' });
            setStep('reset');
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể gửi mã',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!code.trim() || !newPassword || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng điền đầy đủ thông tin' });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu phải có ít nhất 6 ký tự' });
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword({ email: email.trim(), code: code.trim(), newPassword });
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Mật khẩu đã được đặt lại.' });
            navigation.navigate('Login');
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.response?.data?.message || 'Không thể đặt lại mật khẩu',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Quên mật khẩu</Text>
                <Text style={styles.subtitle}>
                    {step === 'email'
                        ? 'Nhập email để nhận mã đặt lại mật khẩu'
                        : 'Nhập mã xác nhận và mật khẩu mới'}
                </Text>

                {step === 'email' ? (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSendCode}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Mã xác nhận (6 số)"
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStep('email')}>
                            <Text style={styles.link}>← Quay lại</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#dfe6e9',
    },
    button: {
        backgroundColor: '#0984e3',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: '#74b9ff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    link: {
        color: '#0984e3',
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
    },
});

export default ForgotPasswordScreen;
