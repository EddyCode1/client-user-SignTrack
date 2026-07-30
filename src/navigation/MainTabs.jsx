import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../shared/constants/theme'

import DashboardScreen from '../features/dashboard/screens/DashboardScreen'
import ChatsScreen from '../features/chats/screens/ChatsScreen'
import CallsScreen from '../features/calls/screens/CallsScreen'
import MoreScreen from '../features/more/screens/MoreScreen'

const Tab = createBottomTabNavigator()

const TAB_ICONS = {
  Dashboard: { focused: 'home', unfocused: 'home-outline' },
  Chats: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Calls: { focused: 'call', unfocused: 'call-outline' },
  More: { focused: 'grid', unfocused: 'grid-outline' },
}

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
        tabBarIcon: ({ color, size, focused }) => {
          const icons = TAB_ICONS[route.name] || { focused: 'ellipse', unfocused: 'ellipse-outline' }
          return <Ionicons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />
        },
        tabBarLabelStyle: { fontSize: 10 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ title: 'Chats' }} />
      <Tab.Screen name="Calls" component={CallsScreen} options={{ title: 'Llamadas' }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: 'Más' }} />
    </Tab.Navigator>
  )
}
