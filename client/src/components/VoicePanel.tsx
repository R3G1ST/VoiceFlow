import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Headphones, PhoneOff, Video, Monitor } from 'lucide-react';
import { useServerStore } from '../stores/serverStore';
import { useAuthStore } from '../stores/authStore';
import { io, Socket } from 'socket.io-client';

interface VoicePanelProps {
  onDisconnect?: () => void;
}

const VOICE_SERVER_URL = import.meta.env.VITE_WS_URL || 'http://77.105.133.95:3001';
const VOICE_ENABLED = import.meta.env.VITE_VOICE_ENABLED !== 'false';

export default function VoicePanel({ onDisconnect }: VoicePanelProps) {
  const { currentChannel } = useServerStore();
  const { user } = useAuthStore();
  
  // Отключаем голос если VOICE_ENABLED = false
  if (!VOICE_ENABLED) {
    return null;
  }
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [error, setError] = useState('');

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentChannel?.type !== 'VOICE' && isConnected) {
      disconnect();
    }
  }, [currentChannel]);

  const connect = async () => {
    if (!currentChannel || !user) return;

    setError('');
    try {
      // Request microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      mediaStreamRef.current = mediaStream;

      // Connect to voice WebSocket
      const token = localStorage.getItem('accessToken');
      const socket = io(`${VOICE_SERVER_URL}/voice`, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      // Join voice channel
      socket.emit('join_voice', {
        channelId: currentChannel.id,
      });

      socket.on('connect', () => {
        console.log('✅ Voice WebSocket connected');
      });

      socket.on('user_connected', (data: any) => {
        console.log('👤 User connected:', data);
        setParticipants(prev => [...prev.filter(p => p.userId !== data.userId), data]);
      });

      socket.on('user_disconnected', (data: any) => {
        console.log('👤 User disconnected:', data);
        setParticipants(prev => prev.filter(p => p.userId !== data.userId));
        // Remove audio element
        const audioEl = audioElementsRef.current.get(data.userId);
        if (audioEl) {
          audioEl.remove();
          audioElementsRef.current.delete(data.userId);
        }
      });

      socket.on('new_producer', (producer: any) => {
        console.log('🎵 New producer:', producer);
        // Could create consumer here
      });

      socket.on('media_state_changed', (data: any) => {
        console.log('🎤 Media state changed:', data);
      });

      socket.on('connect_error', (err: any) => {
        console.error('❌ Voice WebSocket error:', err.message);
        setError('Ошибка подключения к голосовому серверу');
        disconnect();
      });

      setIsConnected(true);
      setParticipants([]);
    } catch (err: any) {
      console.error('❌ Voice connect error:', err);
      setError(err.message || 'Ошибка подключения к голосовому каналу');
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_voice');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Stop media streams
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    // Remove audio elements
    audioElementsRef.current.forEach(el => el.remove());
    audioElementsRef.current.clear();

    setIsConnected(false);
    setIsMuted(false);
    setIsDeafened(false);
    setIsVideoEnabled(false);
    setIsScreenSharing(false);
    setParticipants([]);
    setError('');

    onDisconnect?.();
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Notify others
        socketRef.current?.emit('set_media_state', {
          audio: audioTrack.enabled,
          video: isVideoEnabled,
          screen: isScreenSharing,
        });
      }
    }
  };

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened);
    // Mute all remote audio
    audioElementsRef.current.forEach(el => {
      el.muted = !isDeafened;
    });
  };

  const toggleVideo = async () => {
    if (!mediaStreamRef.current) return;

    if (!isVideoEnabled) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        const videoTrack = videoStream.getVideoTracks()[0];
        mediaStreamRef.current.addTrack(videoTrack);
        setIsVideoEnabled(true);
        
        socketRef.current?.emit('set_media_state', {
          audio: !isMuted,
          video: true,
          screen: isScreenSharing,
        });
      } catch (err) {
        console.error('❌ Video enable error:', err);
      }
    } else {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        mediaStreamRef.current.removeTrack(videoTrack);
        setIsVideoEnabled(false);
        
        socketRef.current?.emit('set_media_state', {
          audio: !isMuted,
          video: false,
          screen: isScreenSharing,
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!mediaStreamRef.current) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Replace existing video track
        const existingVideoTrack = mediaStreamRef.current.getVideoTracks()[0];
        if (existingVideoTrack) {
          mediaStreamRef.current.removeTrack(existingVideoTrack);
          existingVideoTrack.stop();
        }
        mediaStreamRef.current.addTrack(screenTrack);
        
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
        
        socketRef.current?.emit('set_media_state', {
          audio: !isMuted,
          video: isVideoEnabled,
          screen: true,
        });
      } catch (err) {
        console.error('❌ Screen share error:', err);
      }
    } else {
      const screenTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.stop();
        mediaStreamRef.current.removeTrack(screenTrack);
        setIsScreenSharing(false);
        
        socketRef.current?.emit('set_media_state', {
          audio: !isMuted,
          video: isVideoEnabled,
          screen: false,
        });
      }
    }
  };

  if (!currentChannel || currentChannel.type !== 'VOICE') {
    return null;
  }

  return (
    <div className="h-16 bg-[#232428] border-t border-[#1e1f22] px-4 flex items-center justify-between flex-shrink-0">
      {isConnected ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#23a559] flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Подключено к {currentChannel.name}
              </p>
              <p className="text-xs text-[#949ba4]">
                Участников: {participants.length + 1}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded ${isMuted ? 'bg-[#f23f43]' : 'bg-[#383a40] hover:bg-[#474952]'}`}
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={toggleDeafen}
              className={`p-2 rounded ${isDeafened ? 'bg-[#f23f43]' : 'bg-[#383a40] hover:bg-[#474952]'}`}
              title={isDeafened ? 'Включить звук' : 'Выключить звук'}
            >
              <Headphones className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={toggleVideo}
              className={`p-2 rounded ${isVideoEnabled ? 'bg-[#23a559]' : 'bg-[#383a40] hover:bg-[#474952]'}`}
              title={isVideoEnabled ? 'Выключить видео' : 'Включить видео'}
            >
              <Video className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-2 rounded ${isScreenSharing ? 'bg-[#23a559]' : 'bg-[#383a40] hover:bg-[#474952]'}`}
              title={isScreenSharing ? 'Остановить демонстрацию' : 'Демонстрация экрана'}
            >
              <Monitor className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={disconnect}
              className="p-2 rounded bg-[#f23f43] hover:bg-[#d83a3e]"
              title="Отключиться"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#949ba4]" />
            <span className="text-white text-sm">{currentChannel.name}</span>
          </div>
          {error && (
            <span className="text-[#f23f43] text-sm mr-4">{error}</span>
          )}
          <button
            onClick={connect}
            className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium transition-colors"
          >
            Подключиться
          </button>
        </div>
      )}
    </div>
  );
}
