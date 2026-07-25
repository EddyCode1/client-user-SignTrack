import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../shared/constants/theme";

import DashboardScreen from "../features/dashboard/pages/DashboardScreen";
import CustomerRestaurantListScreen from "../features/restaurants/pages/CustomerRestaurantListScreen";
import CustomerMenuScreen from "../features/menu/screens/CustomerMenuScreen";
import CustomerOrdersScreen from "../features/orders/screens/CustomerOrdersScreen";
import CustomerReservationListScreen from "../features/reservations/screens/CustomerReservationListScreen";
import CouponsScreen from "../features/coupons/screens/CouponsScreenIntegrated";
import ContactScreen from "../features/contacts/screens/ContactScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    CustomerHome: "home",
    Restaurants: "restaurant",
    Menu: "restaurant-menu",
    Orders: "receipt-long",
    Reservations: "event",
    Coupons: "discount",
    Contacts: "contact-page",
};

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.secondary,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name={TAB_ICONS[route.name] || "circle"} size={size} color={color} />
                ),
            })}
        >
            <Tab.Screen name="CustomerHome" component={DashboardScreen} options={{ title: "Inicio" }} />
            <Tab.Screen name="Restaurants" component={CustomerRestaurantListScreen} options={{ title: "Restaurantes" }} />
            <Tab.Screen name="Menu" component={CustomerMenuScreen} options={{ title: "Menú" }} />
            <Tab.Screen name="Orders" component={CustomerOrdersScreen} options={{ title: "Órdenes" }} />
            <Tab.Screen name="Reservations" component={CustomerReservationListScreen} options={{ title: "Reservas" }} />
            <Tab.Screen name="Coupons" component={CouponsScreen} options={{ title: "Cupones" }} />
            <Tab.Screen name="Contacts" component={ContactScreen} options={{ title: "Contacto" }} />
        </Tab.Navigator>
    );
}
