import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme'

const ConnectionBanner = () => {
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected)
    })
    return () => unsubscribe()
  }, [])

  if (isConnected) return null

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Sin conexión a internet</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: FONT_SIZE.sm, fontWeight: '600' },
})

export default ConnectionBanner
