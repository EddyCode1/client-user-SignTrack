import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme'

const NotFoundScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.code}>404</Text>
    <Text style={styles.title}>Página no encontrada</Text>
    <Text style={styles.text}>La página que buscas no existe o fue movida.</Text>
    <TouchableOpacity onPress={() => navigation.replace('Dashboard')} style={styles.button}>
      <Text style={styles.buttonText}>Volver al inicio</Text>
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  code: { fontSize: 72, fontWeight: '700', color: COLORS.primary },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  text: { fontSize: FONT_SIZE.sm, color: COLORS.muted, textAlign: 'center', marginTop: SPACING.sm },
  button: { backgroundColor: COLORS.primary, borderRadius: 10, padding: SPACING.md, marginTop: SPACING.xl },
  buttonText: { color: '#fff', fontWeight: '700' },
})

export default NotFoundScreen
