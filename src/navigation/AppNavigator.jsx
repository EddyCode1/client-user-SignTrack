import { useEffect, useState } from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native'
import AuthStack from './AuthStack'
import { useAuthStore } from '../shared/stores/useAuthStore'
import { COLORS } from '../shared/constants/theme'
import ConnectionBanner from '../shared/components/ConnectionBanner'

// Ref global de navegación — usada por componentes fuera del árbol de navigadores
// (ej. IncomingCallModal, servicios de push, etc.)
export const navigationRef = createNavigationContainerRef()

const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [MainStackComponent, setMainStackComponent] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setMainStackComponent(null)
      return
    }

    let active = true
    import('./MainStack').then((mod) => {
      if (active) setMainStackComponent(() => mod.default)
    })

    return () => {
      active = false
    }
  }, [isAuthenticated])

  return (
    <NavigationContainer ref={navigationRef}>
      <ConnectionBanner />
      {isAuthenticated ? (
        MainStackComponent ? (
          <MainStackComponent />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
})

export default AppNavigator
