// apps/mobile-tourist/src/navigation/AppNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import IDScreen from "../screens/IDScreen";
import SafetyScreen from "../screens/SafetyScreen";
import GeoFenceScreen from "../screens/GeoFenceScreen";
import BackgroundScreen from "../screens/BackgroundScreen";
import PanicScreen from "../screens/PanicScreen";
import MapViewScreen from "../screens/MapViewScreen"; 
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Now a dedicated Stack screen
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let name;
                    if (route.name === "Home") {
                        name = "home";
                    } else if (route.name === "Safety") {
                        name = "shield-checkmark";
                    } else if (route.name === "ID") {
                        name = "id-card";
                    }
                    return <Ionicons name={name} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Safety" component={SafetyScreen} />
            <Tab.Screen name="ID" component={IDScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
            
            {/* Main application screen: The Tabs Navigator */}
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            
            {/* Secondary screens accessible from anywhere */}
            {/* Renamed the old 'Home' route (ProfileScreen) to 'Profile' to avoid conflict with Tabs/Home */}
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My profile' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change password' }} />
            
            {/* All other deep-link screens */}
            <Stack.Screen name="MapView" component={MapViewScreen} options={{ title: "Map View" }} />
            <Stack.Screen name="GeoFence" component={GeoFenceScreen} options={{ title: "Geo-Fence" }} />
            <Stack.Screen name="Background" component={BackgroundScreen} options={{ title: "Background Tracking" }} />
            <Stack.Screen name="Panic" component={PanicScreen} options={{ title: "Panic" }} />
        </Stack.Navigator>
    );
}