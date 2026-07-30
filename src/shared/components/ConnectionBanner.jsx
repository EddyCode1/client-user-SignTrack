import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme'

const ConnectionBanner = () => {
  const [isOffline, setIsOffline] = useState(false)
  const opacity = useState(new Animated.Value(0))[0]

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected
      setIsOffline(offline)
      Animated.timing(opacity, {
        toValue: offline ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    })

    return unsubscribe
  }, [opacity])

  if (!isOffline) return null

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      <Text style={styles.text}>Sin conexión a internet</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
})

export default ConnectionBanner
