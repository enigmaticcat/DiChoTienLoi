import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import OTPVerifyScreen from '../screens/Auth/OTPVerifyScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/Home/HomeScreen';
import FridgeScreen from '../screens/Fridge/FridgeScreen';
import ShoppingScreen from '../screens/Shopping/ShoppingScreen';
import MealPlanScreen from '../screens/MealPlan/MealPlanScreen';
import RecipeScreen from '../screens/Recipe/RecipeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// Profile Sub-screens
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import GroupScreen from '../screens/Group/GroupScreen';

// Admin Screens
import AdminStatsScreen from '../screens/Admin/AdminStatsScreen';
import UserManagementScreen from '../screens/Admin/UserManagementScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
);

// Tab Icon Component
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
    <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.6 }}>
        {icon}
    </Text>
);

// Main Tabs
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                height: 80,
                paddingTop: 8,
                paddingBottom: 24,
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#eee',
            },
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '500',
            },
            tabBarActiveTintColor: '#0984e3',
            tabBarInactiveTintColor: '#636e72',
        }}
    >
        <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
                tabBarLabel: 'Trang chủ',
                tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
            }}
        />
        <Tab.Screen
            name="Fridge"
            component={FridgeScreen}
            options={{
                tabBarLabel: 'Tủ lạnh',
                tabBarIcon: ({ focused }) => <TabIcon icon="❄️" focused={focused} />,
            }}
        />
        <Tab.Screen
            name="Shopping"
            component={ShoppingScreen}
            options={{
                tabBarLabel: 'Mua sắm',
                tabBarIcon: ({ focused }) => <TabIcon icon="🛒" focused={focused} />,
            }}
        />
        <Tab.Screen
            name="MealPlan"
            component={MealPlanScreen}
            options={{
                tabBarLabel: 'Bữa ăn',
                tabBarIcon: ({ focused }) => <TabIcon icon="🍽️" focused={focused} />,
            }}
        />
        <Tab.Screen
            name="Recipe"
            component={RecipeScreen}
            options={{
                tabBarLabel: 'Công thức',
                tabBarIcon: ({ focused }) => <TabIcon icon="📖" focused={focused} />,
            }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                tabBarLabel: 'Cá nhân',
                tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
            }}
        />
    </Tab.Navigator>
);

// Main Stack (Tabs + Modal screens)
const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Group" component={GroupScreen} />
        <Stack.Screen name="AdminStats" component={AdminStatsScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
    </Stack.Navigator>
);

// App Navigator
const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
