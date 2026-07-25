import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  // Reemplazo del "círculo de puntos" por un elemento decorativo estático 
  // o un gradiente premium para mantener la estética sin sobrecargar el CPU móvil
  decorativeCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignSelf: 'center',
    top: '10%',
  },
  loginBox: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 20,
  },
  inputBox: {
    marginVertical: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#111111',
  },
  btn: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPass: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPassText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  }
});