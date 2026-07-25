import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { COLORS } from '../constants/theme'

const Spinner = ({ size = 'large', color = COLORS.primary }) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color} />
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
})

export default Spinner
