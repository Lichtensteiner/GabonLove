import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneOff, MicOff, Mic, VideoOff, Video, RotateCw } from "lucide-react";
import Button from "./ui/Button";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: { userId: string; displayName: string; mainPhoto?: string };
  type: "video" | "audio";
}

export default function CallModal({ isOpen, onClose, otherUser, type }: CallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === "audio");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    } else {
      stopCamera();
      setCallDuration(0);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true
      });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erreur accès média:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-stone-900 flex flex-col items-center justify-center text-white"
      >
        {/* Background Blur / Video Container */}
        <div className="absolute inset-0 overflow-hidden">
          {type === "video" && !isVideoOff ? (
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover opacity-30 blur-2xl scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-950" />
          )}
        </div>

        {/* Call Info */}
        <div className="relative z-10 text-center mb-12">
          <div className="w-32 h-32 mx-auto rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl mb-6">
            <img 
              src={otherUser?.mainPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.userId}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-3xl font-serif font-bold italic mb-2 tracking-tight">Appel avec {otherUser?.displayName}</h2>
          <div className="flex items-center justify-center gap-3">
             <span className="w-2 h-2 rounded-full bg-love-red animate-pulse" />
             <p className="text-white/60 font-mono tracking-widest text-sm">{formatDuration(callDuration)}</p>
          </div>
        </div>

        {/* Local Video Preview (Floating) */}
        {type === "video" && !isVideoOff && (
          <motion.div 
            drag
            dragConstraints={{ left: -100, right: 100, top: -200, bottom: 200 }}
            className="absolute top-8 right-8 w-32 h-48 bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 z-20 cursor-move"
          >
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </motion.div>
        )}

        {/* Controls */}
        <div className="relative z-10 flex items-center gap-6 mt-auto mb-16">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            className={`w-16 h-16 rounded-full transition-all ${isMuted ? 'bg-white text-stone-950 scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/30 scale-110 transition-transform active:scale-95"
          >
            <PhoneOff className="w-8 h-8 fill-current" />
          </Button>

          {type === "video" && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleVideo}
              className={`w-16 h-16 rounded-full transition-all ${isVideoOff ? 'bg-white text-stone-950 scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="w-16 h-16 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <RotateCw className="w-6 h-6" />
          </Button>
        </div>
        
        <p className="relative z-10 text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">GabonLove • Crypté de bout en bout</p>
      </motion.div>
    </AnimatePresence>
  );
}
