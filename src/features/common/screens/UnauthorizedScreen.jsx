import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme'

const UnauthorizedScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>!</Text>
    <Text style={styles.title}>Acceso denegado</Text>
    <Text style={styles.text}>No tienes permisos para acceder a esta sección.</Text>
    <TouchableOpacity onPress={() => navigation.replace('Dashboard')} style={styles.button}>
      <Text style={styles.buttonText}>Volver al inicio</Text>
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  icon: { fontSize: 72, fontWeight: '700', color: COLORS.error },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  text: { fontSize: FONT_SIZE.sm, color: COLORS.muted, textAlign: 'center', marginTop: SPACING.sm },
  button: { backgroundColor: COLORS.primary, borderRadius: 10, padding: SPACING.md, marginTop: SPACING.xl },
  buttonText: { color: '#fff', fontWeight: '700' },
})

export default UnauthorizedScreen
