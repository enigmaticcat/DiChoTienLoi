import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

interface Props {
    navigation: any;
    route: { params: { email: string } };
}

const OTPVerifyScreen: React.FC<Props> = ({ navigation, route }) => {
    const { email } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const { verifyEmail, sendVerificationCode } = useAuth();

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập đủ 6 số',
            });
            return;
        }

        setIsLoading(true);
        const result = await verifyEmail(code);
        setIsLoading(false);

        if (result.success) {
            Toast.show({
                type: 'success',
                text1: 'Thành công! 🎉',
                text2: 'Email đã được xác thực!',
                visibilityTime: 2000,
                onHide: () => navigation.navigate('Login'),
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Thất bại',
                text2: result.message,
            });
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        const result = await sendVerificationCode(email);
        setIsLoading(false);

        if (result.success) {
            setResendTimer(60);
            const timer = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            Toast.show({
                type: 'success',
                text1: 'Đã gửi!',
                text2: 'Mã xác thực mới đã được gửi đến email của bạn',
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: result.message,
            });
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.icon}>📧</Text>
                    <Text style={styles.title}>Xác thực Email</Text>
                    <Text style={styles.subtitle}>
                        Nhập mã 6 số đã gửi đến{'\n'}
                        <Text style={styles.email}>{email}</Text>
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[styles.otpInput, digit && styles.otpInputFilled]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Xác thực</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResend}
                    disabled={resendTimer > 0 || isLoading}
                >
                    <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
                        {resendTimer > 0 ? `Gửi lại sau ${resendTimer}s` : 'Gửi lại mã'}
                    </Text>
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
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#636e72',
        textAlign: 'center',
        lineHeight: 22,
    },
    email: {
        color: '#00b894',
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 12,
    },
    otpInput: {
        width: 48,
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2d3436',
    },
    otpInputFilled: {
        borderColor: '#00b894',
        backgroundColor: '#e8f8f5',
    },
    button: {
        backgroundColor: '#00b894',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        color: '#00b894',
        fontSize: 14,
        fontWeight: '600',
    },
    resendDisabled: {
        color: '#b2bec3',
    },
});

export default OTPVerifyScreen;
