import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

interface Props {
    navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng điền đầy đủ thông tin',
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Mật khẩu không khớp',
            });
            return;
        }

        if (password.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Mật khẩu phải có ít nhất 6 ký tự',
            });
            return;
        }

        setIsLoading(true);
        const result = await register(email, password, name);
        setIsLoading(false);

        if (result.success) {
            Toast.show({
                type: 'success',
                text1: 'Đăng ký thành công! 🎉',
                text2: 'Vui lòng kiểm tra email để xác thực tài khoản',
                visibilityTime: 3000,
                onHide: () => navigation.navigate('OTPVerify', { email }),
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Đăng ký thất bại',
                text2: result.message,
            });
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.logo}></Text>
                    <Text style={styles.title}>Tạo tài khoản</Text>
                    <Text style={styles.subtitle}>Đăng ký để bắt đầu</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Họ tên</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nguyễn Văn A"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mật khẩu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tối thiểu 6 ký tự"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Xác nhận mật khẩu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Đăng ký</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>
                            Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#636e72',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f1f3f4',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#2d3436',
    },
    button: {
        backgroundColor: '#00b894',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#636e72',
        fontSize: 14,
    },
    linkBold: {
        color: '#00b894',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
