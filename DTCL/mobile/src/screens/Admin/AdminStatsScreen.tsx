import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
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

const AdminStatsScreen: React.FC<Props> = ({ navigation }) => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await adminApi.getStats();
            setStats(res.data.data);
        } catch (error) {
            console.error('Load stats error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.title}> Thống kê hệ thống</Text>
            </View>

            <View style={styles.statsGrid}>
                <StatCard
                    icon=""
                    title="Tổng người dùng"
                    value={stats?.users?.total}
                    color="#6c5ce7"
                />
                <StatCard
                    icon=""
                    title="Đã xác minh"
                    value={stats?.users?.verified}
                    color="#00b894"
                />
                <StatCard
                    icon=""
                    title="Admin"
                    value={stats?.users?.admins}
                    color="#fdcb6e"
                />
                <StatCard
                    icon=""
                    title="Nhóm gia đình"
                    value={stats?.groups}
                    color="#0984e3"
                />
                <StatCard
                    icon=""
                    title="Danh mục"
                    value={stats?.categories}
                    color="#e17055"
                />
                <StatCard
                    icon=""
                    title="Đơn vị"
                    value={stats?.units}
                    color="#636e72"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quản lý nhanh</Text>
                <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => navigation.navigate('UserManagement')}
                >
                    <Text style={styles.quickIcon}></Text>
                    <Text style={styles.quickText}>Quản lý người dùng</Text>
                    <Text style={styles.quickArrow}>›</Text>
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
