import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import { useAuthStore } from "../shared/store/authStore";
import { COLORS } from "../shared/constants/theme";

const AppNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [MainTabs, setMainTabs] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setMainTabs(null);
            return;
        }

        let active = true;
        import("./MainStack").then((mod) => {
            if (active) setMainTabs(() => mod.default);
        });

        return () => {
            active = false;
        };
    }, [isAuthenticated]);

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                MainTabs ? (
                    <MainTabs />
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                )
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
    },
});

export default AppNavigator;
