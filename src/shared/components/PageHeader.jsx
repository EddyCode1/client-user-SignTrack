import { View, Text, StyleSheet } from 'react-native'
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme'

const PageHeader = ({ title, subtitle }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
)

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.muted, marginTop: SPACING.xs },
})

export default PageHeader
