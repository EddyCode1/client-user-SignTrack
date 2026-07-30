import { Component } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme'

/**
 * Captura crashes de JS y muestra el error en pantalla
 * (en vez de quedarse en negro sin feedback).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    const message = this.state.error?.message || String(this.state.error)

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error en la app</Text>
        <Text style={styles.subtitle}>Algo falló al cargar la pantalla principal.</Text>
        <ScrollView style={styles.box}>
          <Text style={styles.errorText} selectable>
            {message}
          </Text>
        </ScrollView>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => this.setState({ error: null })}
        >
          <Text style={styles.btnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.error, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZE.md, color: COLORS.muted, marginBottom: SPACING.md },
  box: {
    maxHeight: 220,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  errorText: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontFamily: 'monospace' },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
})
