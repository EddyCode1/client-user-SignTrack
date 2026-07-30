import { ActivityIndicator, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MainTabs from './MainTabs'
import ErrorBoundary from '../shared/components/ErrorBoundary'
import IncomingCallModal from '../features/calls/components/IncomingCallModal'
import { COLORS } from '../shared/constants/theme'

// Pantallas ligeras — se importan de inmediato
import GroupDetailScreen from '../features/groups/screens/GroupDetailScreen'
import UsersScreen from '../features/users/screens/UsersScreen'
import ProfileScreen from '../features/users/screens/ProfileScreen'
import TasksScreen from '../features/tasks/screens/TasksScreen'
import CalendarScreen from '../features/calendar/screens/CalendarScreen'
import ContactsScreen from '../features/contacts/screens/ContactsScreen'
import GroupsScreen from '../features/groups/screens/GroupsScreen'
import RequestsScreen from '../features/requests/screens/RequestsScreen'
import NotFoundScreen from '../features/common/screens/NotFoundScreen'
import UnauthorizedScreen from '../features/common/screens/UnauthorizedScreen'

// Pantallas pesadas (WebRTC / LiveKit / cámara) — lazy para no tumbar el dashboard
import { lazy, Suspense } from 'react'

const ChatRoomScreen = lazy(() => import('../features/chats/screens/ChatRoomScreen'))
const CallRoomScreen = lazy(() => import('../features/calls/screens/CallRoomScreen'))
const CallRoomLiveKitScreen = lazy(() => import('../features/calls/screens/CallRoomLiveKitScreen'))

const Stack = createNativeStackNavigator()

const LazyScreen = (Component) => {
  const Wrapped = (props) => (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      }
    >
      <Component {...props} />
    </Suspense>
  )
  Wrapped.displayName = `Lazy(${Component.displayName || Component.name || 'Screen'})`
  return Wrapped
}

export default function MainStack() {
  return (
    <ErrorBoundary>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ChatRoom" component={LazyScreen(ChatRoomScreen)} />
        <Stack.Screen
          name="CallRoom"
          component={LazyScreen(CallRoomScreen)}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="CallRoomLiveKit"
          component={LazyScreen(CallRoomLiveKitScreen)}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
        <Stack.Screen name="Users" component={UsersScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="Groups" component={GroupsScreen} />
        <Stack.Screen name="Requests" component={RequestsScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
        <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />
      </Stack.Navigator>

      <IncomingCallModal />
    </ErrorBoundary>
  )
}
