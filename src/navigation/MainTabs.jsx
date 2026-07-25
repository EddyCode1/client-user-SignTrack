import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../shared/constants/theme'

import DashboardScreen from '../features/dashboard/screens/DashboardScreen'
import ChatsScreen from '../features/chats/screens/ChatsScreen'
import CallsScreen from '../features/calls/screens/CallsScreen'
import TasksScreen from '../features/tasks/screens/TasksScreen'
import CalendarScreen from '../features/calendar/screens/CalendarScreen'
import ContactsScreen from '../features/contacts/screens/ContactsScreen'
import GroupsScreen from '../features/groups/screens/GroupsScreen'
import RequestsScreen from '../features/requests/screens/RequestsScreen'
import ProfileScreen from '../features/users/screens/ProfileScreen'

const Tab = createBottomTabNavigator()

const TAB_ICONS = {
  Dashboard: { focused: 'home', unfocused: 'home-outline' },
  Chats: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Calls: { focused: 'call', unfocused: 'call-outline' },
  Tasks: { focused: 'checkbox', unfocused: 'checkbox-outline' },
  Calendar: { focused: 'calendar', unfocused: 'calendar-outline' },
  Contacts: { focused: 'people', unfocused: 'people-outline' },
  Groups: { focused: 'people-circle', unfocused: 'people-circle-outline' },
  Requests: { focused: 'notifications', unfocused: 'notifications-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
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
        tabBarIcon: ({ color, size }) => {
          const icons = TAB_ICONS[route.name] || { focused: 'ellipse', unfocused: 'ellipse-outline' }
          return (
            <Ionicons
              name={icons.focused}
              size={size}
              color={color}
            />
          )
        },
        tabBarLabelStyle: { fontSize: 10 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ title: 'Chats' }} />
      <Tab.Screen name="Calls" component={CallsScreen} options={{ title: 'Llamadas' }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tareas' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendario' }} />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Contactos' }} />
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ title: 'Grupos' }} />
      <Tab.Screen name="Requests" component={RequestsScreen} options={{ title: 'Solicitudes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  )
}
