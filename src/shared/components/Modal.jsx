import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme'

const Modal = ({ visible, onClose, title, children }) => (
  <RNModal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </RNModal>
)

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.lg },
  content: { backgroundColor: COLORS.surface, borderRadius: 12, padding: SPACING.lg },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  closeBtn: { marginTop: SPACING.md, alignItems: 'center' },
  closeText: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '600' },
})

export default Modal
