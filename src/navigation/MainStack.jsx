import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerMainLayout from '../features/layout/screens/CustomerMainLayout';

import MainTabs from './MainTabs';
import CustomerMapaGeneralScreen from '../features/mapa/screens/CustomerMapaGeneralScreen';
import CustomerRestaurantMapScreen from '../features/mapa/screens/CustomerRestaurantMapScreen';
import CustomerRestaurantMenuScreen from '../features/menu/screens/CustomerRestaurantMenuScreen';
import CustomerOrderCreateScreen from '../features/orders/screens/CustomerOrderCreateScreen';
import CustomerReservationCreateScreen from '../features/reservations/screens/CustomerReservationCreateScreen';
import CustomerFacturaScreen from '../features/factura/screens/CustomerFacturaScreen';
import CustomerFacturaPrintScreen from '../features/factura/screens/CustomerFacturaPrintScreen';
import CustomerTableLayoutScreen from '../features/tables/screens/CustomerTableLayoutScreen';
import CustomerReviewsScreen from '../features/restaurants/screens/CustomerReviewsScreen';

const Stack = createNativeStackNavigator();

function MainTabsWithLayout() {
  return (
    <CustomerMainLayout>
      <MainTabs />
    </CustomerMainLayout>
  );
}

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabsWithLayout} />
      <Stack.Screen name="MapaGeneral" component={CustomerMapaGeneralScreen} />
      <Stack.Screen name="RestaurantMap" component={CustomerRestaurantMapScreen} />
      <Stack.Screen name="RestaurantMenu" component={CustomerRestaurantMenuScreen} />
      <Stack.Screen name="RestaurantOrders" component={CustomerOrderCreateScreen} />
      <Stack.Screen name="OrderCreate" component={CustomerOrderCreateScreen} />
      <Stack.Screen name="CreateReservation" component={CustomerReservationCreateScreen} />
      <Stack.Screen name="TableLayout" component={CustomerTableLayoutScreen} />
      <Stack.Screen name="Reviews" component={CustomerReviewsScreen} />
      <Stack.Screen name="OrderDetails" component={CustomerFacturaScreen} />
      <Stack.Screen name="Factura" component={CustomerFacturaScreen} />
      <Stack.Screen name="FacturaPrint" component={CustomerFacturaPrintScreen} />
    </Stack.Navigator>
  );
}
