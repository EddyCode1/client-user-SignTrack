import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MainTabs from './MainTabs'
import ChatRoomScreen from '../features/chats/screens/ChatRoomScreen'
import GroupDetailScreen from '../features/groups/screens/GroupDetailScreen'
import UsersScreen from '../features/users/screens/UsersScreen'
import NotFoundScreen from '../features/common/screens/NotFoundScreen'
import UnauthorizedScreen from '../features/common/screens/UnauthorizedScreen'

const Stack = createNativeStackNavigator()

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
      <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />
    </Stack.Navigator>
  )
}
