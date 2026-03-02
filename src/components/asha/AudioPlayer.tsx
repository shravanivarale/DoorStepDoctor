/**
 * Audio Player Component
 * 
 * Plays TTS audio responses with controls
 */

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  language: string;
  autoPlay?: boolean;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  text, 
  language, 
  autoPlay = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (autoPlay) {
      handlePlay();
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (utteranceRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = async () => {
    if (isPlaying) {
      handleStop();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use Web Speech API for browser-based TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setError('Failed to play audio');
          setIsPlaying(false);
          setIsLoading(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        setError('Text-to-speech not supported in this browser');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio');
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePlay}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors ${
          isPlaying
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        title={isPlaying ? 'Stop audio' : 'Play audio'}
      >
        {isLoading ? (
          <Loader size={20} className="animate-spin" />
        ) : isPlaying ? (
          <VolumeX size={20} />
        ) : (
          <Volume2 size={20} />
        )}
      </button>
      
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
      
      {isPlaying && (
        <span className="text-xs text-gray-600 animate-pulse">Playing...</span>
      )}
    </div>
  );
};

export default AudioPlayer;
