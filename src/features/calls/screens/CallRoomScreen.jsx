import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  RTCView,
} from '@livekit/react-native-webrtc'
import { Ionicons } from '@expo/vector-icons'
import {
  getCallsHubConnection,
  joinCallRoomHub,
  leaveCallRoomHub,
  sendOfferHub,
  sendAnswerHub,
  sendIceCandidateHub,
  onExistingParticipants,
  onParticipantJoined,
  onParticipantLeft,
  onReceiveOffer,
  onReceiveAnswer,
  onReceiveIceCandidate,
  onRoomEnded,
} from '../../../shared/api/callsHubService'
import { getRoom, joinRoom } from '../../../shared/api/services/callsService'
import { useAuthStore } from '../../../shared/stores/useAuthStore'
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme'

const CallRoomScreen = ({ route, navigation }) => {
  const { roomId } = route.params
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser?.id || currentUser?._id

  const [room, setRoom] = useState(null)
  const [hubReady, setHubReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [remoteStreams, setRemoteStreams] = useState({})

  const localStreamRef = useRef(null)
  const peerConnectionsRef = useRef(new Map())
  const iceServersRef = useRef([{ urls: 'stun:stun.l.google.com:19302' }])
  const makingOfferRef = useRef(new Set())

  const stopLocalMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
  }, [])

  const closePeerConnection = useCallback((userId) => {
    const pc = peerConnectionsRef.current.get(userId)
    if (pc) {
      pc.close()
      peerConnectionsRef.current.delete(userId)
    }
    makingOfferRef.current.delete(userId)
    setRemoteStreams((prev) => {
      if (!prev[userId]) return prev
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }, [])

  const closeAllPeers = useCallback(() => {
    peerConnectionsRef.current.forEach((pc) => pc.close())
    peerConnectionsRef.current.clear()
    makingOfferRef.current.clear()
    setRemoteStreams({})
  }, [])

  const getOrCreatePeerConnection = useCallback(
    (remoteUserId) => {
      let pc = peerConnectionsRef.current.get(remoteUserId)
      if (pc) return pc

      pc = new RTCPeerConnection({ iceServers: iceServersRef.current })

      const localStream = localStreamRef.current
      if (localStream) {
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream))
      }

      pc.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          sendIceCandidateHub(roomId, remoteUserId, event.candidate.toJSON()).catch(() => {})
        }
      })

      pc.addEventListener('track', (event) => {
        const [remoteStream] = event.streams
        if (remoteStream) {
          setRemoteStreams((prev) => ({ ...prev, [remoteUserId]: remoteStream }))
        }
      })

      pc.addEventListener('connectionstatechange', () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          closePeerConnection(remoteUserId)
        }
      })

      peerConnectionsRef.current.set(remoteUserId, pc)
      return pc
    },
    [roomId, closePeerConnection]
  )

  const createAndSendOffer = useCallback(
    async (remoteUserId) => {
      if (!remoteUserId || remoteUserId === currentUserId) return
      if (makingOfferRef.current.has(remoteUserId)) return

      makingOfferRef.current.add(remoteUserId)
      try {
        const pc = getOrCreatePeerConnection(remoteUserId)
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        await pc.setLocalDescription(offer)
        await sendOfferHub(roomId, remoteUserId, pc.localDescription)
      } catch (err) {
        closePeerConnection(remoteUserId)
      } finally {
        makingOfferRef.current.delete(remoteUserId)
      }
    },
    [roomId, currentUserId, getOrCreatePeerConnection, closePeerConnection]
  )

  const handleRemoteOffer = useCallback(
    async ({ roomId: rid, fromUserId, targetUserId, sdp }) => {
      if (rid !== roomId || targetUserId !== currentUserId) return
      try {
        const pc = getOrCreatePeerConnection(fromUserId)
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        await sendAnswerHub(roomId, fromUserId, pc.localDescription)
      } catch {
        closePeerConnection(fromUserId)
      }
    },
    [roomId, currentUserId, getOrCreatePeerConnection, closePeerConnection]
  )

  const handleRemoteAnswer = useCallback(
    async ({ roomId: rid, fromUserId, targetUserId, sdp }) => {
      if (rid !== roomId || targetUserId !== currentUserId) return
      const pc = peerConnectionsRef.current.get(fromUserId)
      if (!pc) return
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      } catch {
        /* error de SDP */
      }
    },
    [roomId, currentUserId]
  )

  const handleRemoteIce = useCallback(
    async ({ roomId: rid, fromUserId, targetUserId, candidate }) => {
      if (rid !== roomId || targetUserId !== currentUserId) return
      const pc = peerConnectionsRef.current.get(fromUserId)
      if (!pc || !candidate) return
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch {
        /* candidato ICE inválido */
      }
    },
    [roomId, currentUserId]
  )

  // Inicializar media y hub
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        // Cargar datos de la sala y ICE servers
        const [roomData, joinData] = await Promise.all([
          getRoom(roomId),
          joinRoom(roomId, currentUser?.username || currentUser?.nombre),
        ])

        if (cancelled) return
        setRoom(roomData)

        if (joinData?.iceServers?.length) {
          iceServersRef.current = joinData.iceServers
        }

        // Obtener stream local
        const stream = await mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: true,
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        localStreamRef.current = stream

        // Conectar hub
        await getCallsHubConnection()
        if (cancelled) return
        await joinCallRoomHub(roomId)
        if (!cancelled) {
          setHubReady(true)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false)
          Alert.alert(
            'Error',
            err.name === 'NotAllowedError'
              ? 'Permite acceso a cámara y micrófono para la videollamada.'
              : err.message || 'No se pudo iniciar la llamada'
          )
        }
      }
    }

    init()

    return () => {
      cancelled = true
      leaveCallRoomHub(roomId).catch(() => {})
      closeAllPeers()
      stopLocalMedia()
    }
  }, [roomId, currentUser, closeAllPeers, stopLocalMedia])

  // Escuchar eventos del hub
  useEffect(() => {
    const offExisting = onExistingParticipants(({ roomId: rid, userIds }) => {
      if (rid !== roomId) return
      userIds.forEach((uid) => createAndSendOffer(uid))
    })

    const offJoined = onParticipantJoined(({ roomId: rid, userId }) => {
      if (rid !== roomId || userId === currentUserId) return
      // El participante que llega crea la oferta en su lado
    })

    const offLeft = onParticipantLeft(({ roomId: rid, userId }) => {
      if (rid !== roomId) return
      closePeerConnection(userId)
    })

    const offOffer = onReceiveOffer(handleRemoteOffer)
    const offAnswer = onReceiveAnswer(handleRemoteAnswer)
    const offIce = onReceiveIceCandidate(handleRemoteIce)

    const offEnded = onRoomEnded(({ roomId: rid }) => {
      if (rid !== roomId) return
      Alert.alert('Reunión terminada', 'El host ha terminado la reunión.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    })

    return () => {
      offExisting()
      offJoined()
      offLeft()
      offOffer()
      offAnswer()
      offIce()
      offEnded()
    }
  }, [roomId, currentUserId, createAndSendOffer, closePeerConnection, handleRemoteOffer, handleRemoteAnswer, handleRemoteIce, navigation])

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMuted(!track.enabled)
  }

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setVideoOff(!track.enabled)
  }

  const handleLeave = async () => {
    await leaveCallRoomHub(roomId).catch(() => {})
    closeAllPeers()
    stopLocalMedia()
    navigation.goBack()
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Conectando...</Text>
      </View>
    )
  }

  const remoteEntries = Object.entries(remoteStreams)
  const localStream = localStreamRef.current

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeave}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {room?.title || 'Llamada'}
        </Text>
        <View style={[styles.statusDot, hubReady ? styles.statusOnline : styles.statusOffline]} />
      </View>

      {/* Videos */}
      <View style={styles.videoGrid}>
        {/* Stream local */}
        {localStream && !videoOff ? (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            mirror
            objectFit="cover"
          />
        ) : (
          <View style={[styles.localVideo, styles.videoOff]}>
            <Ionicons name="videocam-off" size={32} color={COLORS.muted} />
            <Text style={styles.videoOffText}>Tú {muted ? '· Mic off' : ''}</Text>
          </View>
        )}

        {/* Streams remotos */}
        {remoteEntries.length === 0 ? (
          <View style={styles.waitingContainer}>
            <Ionicons name="people-outline" size={48} color={COLORS.muted} />
            <Text style={styles.waitingText}>Esperando participantes...</Text>
          </View>
        ) : (
          remoteEntries.map(([userId, stream]) => (
            <View key={userId} style={styles.remoteVideoContainer}>
              <RTCView
                streamURL={stream.toURL()}
                style={styles.remoteVideo}
                objectFit="cover"
              />
            </View>
          ))
        )}
      </View>

      {/* Controles */}
      <View style={[styles.controls, SHADOWS.md]}>
        <TouchableOpacity
          style={[styles.controlBtn, muted && styles.controlBtnActive]}
          onPress={toggleMute}
        >
          <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color={muted ? COLORS.error : '#fff'} />
          <Text style={[styles.controlLabel, muted && { color: COLORS.error }]}>
            {muted ? 'Activar' : 'Silenciar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.hangupBtn} onPress={handleLeave}>
          <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, videoOff && styles.controlBtnActive]}
          onPress={toggleVideo}
        >
          <Ionicons name={videoOff ? 'videocam-off' : 'videocam'} size={24} color={videoOff ? COLORS.error : '#fff'} />
          <Text style={[styles.controlLabel, videoOff && { color: COLORS.error }]}>
            {videoOff ? 'Cámara' : 'Apagar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusOnline: { backgroundColor: COLORS.success },
  statusOffline: { backgroundColor: COLORS.warning },

  videoGrid: { flex: 1 },
  localVideo: {
    width: '100%',
    height: '50%',
    backgroundColor: '#1a1a1a',
  },
  videoOff: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  videoOffText: { color: COLORS.muted, fontSize: FONT_SIZE.sm },
  remoteVideoContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: '#111',
  },
  remoteVideo: { flex: 1 },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
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
  controlBtn: {
    alignItems: 'center',
    gap: 4,
    padding: SPACING.sm,
  },
  controlBtnActive: {},
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

export default CallRoomScreen
