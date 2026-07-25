import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../constants/theme'

const ICON_MAP = {
  FiUser: 'person-outline',
  FiUsers: 'people-outline',
  FiBell: 'notifications-outline',
  FiMessageSquare: 'chatbubbles-outline',
  FiPhone: 'call-outline',
  FiCheckSquare: 'checkbox-outline',
  FiCalendar: 'calendar-outline',
}

const AnimatedCard = ({ title, description, icon, accent, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.card, SHADOWS.sm]}>
    <View style={[styles.iconWrap, { backgroundColor: `${accent === 'brand' ? COLORS.primary : COLORS.border}` }]}>
      <Ionicons
        name={ICON_MAP[icon] || 'grid-outline'}
        size={24}
        color={accent === 'brand' ? '#fff' : COLORS.text}
      />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    width: '48%',
    marginBottom: SPACING.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  description: { fontSize: FONT_SIZE.xs, color: COLORS.muted },
})

export default AnimatedCard
