import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import {
  AudioSession,
  LiveKitRoom,
  VideoTrack,
  useParticipants,
  useLocalParticipant,
  useTracks,
} from '@livekit/react-native'
import { Track } from 'livekit-client'
import { Ionicons } from '@expo/vector-icons'
import { getLiveKitToken } from '../../../shared/api/services/callsService'
import { LIVEKIT_URL } from '../../../shared/config/env'
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme'

// Tile de participante remoto
const ParticipantTile = ({ trackRef }) => {
  return (
    <View style={styles.tile}>
      <VideoTrack trackRef={trackRef} style={styles.tileVideo} objectFit="cover" />
    </View>
  )
}

// Contenido de la sala — usa hooks de LiveKit
const RoomContent = ({ roomId, onLeave, room }) => {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
  ])

  const toggleMute = () => {
    localParticipant?.setMicrophoneEnabled(muted)
    setMuted(!muted)
  }

  const toggleVideo = () => {
    localParticipant?.setCameraEnabled(videoOff)
    setVideoOff(!videoOff)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onLeave}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {room?.title || 'Sala grupal'}
        </Text>
        <Text style={styles.participantCount}>{participants.length} participantes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {tracks.map((trackRef, i) => (
          <ParticipantTile key={i} trackRef={trackRef} />
        ))}
        {tracks.length === 0 && (
          <View style={styles.waitingContainer}>
            <Ionicons name="people-outline" size={48} color={COLORS.muted} />
            <Text style={styles.waitingText}>Esperando participantes...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
          <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color={muted ? COLORS.error : '#fff'} />
          <Text style={styles.controlLabel}>{muted ? 'Activar' : 'Silenciar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.hangupBtn} onPress={onLeave}>
          <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={toggleVideo}>
          <Ionicons name={videoOff ? 'videocam-off' : 'videocam'} size={24} color={videoOff ? COLORS.error : '#fff'} />
          <Text style={styles.controlLabel}>{videoOff ? 'Activar' : 'Apagar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Pantalla principal que obtiene el token y monta la sala
const CallRoomLiveKitScreen = ({ route, navigation }) => {
  const { roomId } = route.params
  const [token, setToken] = useState(null)
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const start = async () => {
      try {
        // Iniciar sesión de audio (requerido en iOS)
        await AudioSession.startAudioSession()

        const data = await getLiveKitToken(roomId)
        setToken(data?.token || data)
        setRoom(data?.room || null)
      } catch (err) {
        Alert.alert('Error', err.message || 'No se pudo obtener el token de la sala', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ])
      } finally {
        setLoading(false)
      }
    }

    start()

    return () => {
      AudioSession.stopAudioSession().catch(() => {})
    }
  }, [roomId, navigation])

  const handleLeave = () => {
    navigation.goBack()
  }

  if (loading || !token) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Conectando a la sala grupal...</Text>
      </View>
    )
  }

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token={token}
      connect
      options={{ adaptiveStream: true, dynacast: true }}
      audio
      video
    >
      <RoomContent roomId={roomId} room={room} onLeave={handleLeave} />
    </LiveKitRoom>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: '#fff', marginTop: SPACING.md, fontSize: FONT_SIZE.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.xl,
    gap: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
  participantCount: { color: COLORS.muted, fontSize: FONT_SIZE.sm },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  tile: {
    width: '48%',
    aspectRatio: 4 / 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tileVideo: { flex: 1 },

  waitingContainer: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  waitingText: { color: COLORS.muted, fontSize: FONT_SIZE.md },

  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlBtn: { alignItems: 'center', gap: 4, padding: SPACING.sm },
  controlLabel: { color: '#fff', fontSize: FONT_SIZE.xs },
  hangupBtn: {
    backgroundColor: COLORS.error,
    borderRadius: 50,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default CallRoomLiveKitScreen
