
import React, { useState, useEffect, useRef } from 'react';
import type { Video } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { api } from '../services/api';
import { Loader } from './Loader';
import { Icon } from './icons';
import { ErrorMessage } from './ErrorMessage';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
  onBookmarkToggle: (uuid: string, isBookmarked: boolean) => Promise<boolean>;
  isInitiallyBookmarked: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose, onBookmarkToggle, isInitiallyBookmarked }) => {
  const telegram = useTelegram();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(isInitiallyBookmarked);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchVideo = async () => {
    if (!telegram) return;
    setIsLoading(true);
    setError(null);

    try {
      /**
       * TECHNICAL NOTE: The backend's /api/stream/{uuid} endpoint is protected and requires an
       * auth header. A standard <video src="..."> tag cannot send custom headers.
       * To work around this limitation without changing the backend, we fetch the entire video
       * as a Blob using our authenticated API service, create a local URL for it, and
       * play it from the user's memory.
       *
       * DOWNSIDE: This prevents streaming and can use significant memory for large files.
       * The video will only start playing after it has been fully downloaded.
       *
       * IDEAL SOLUTION: The backend should provide a separate, authenticated endpoint
       * that returns a short-lived, direct, public URL to the video file, which can then
       * be used in the <video> src attribute for proper streaming.
       */
      const blob = await api.get<Blob>(`/stream/${video.uuid}`, telegram.initData);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (e: any) {
      console.error("Failed to load video:", e);
      setError(e.message || "Could not load video. It may have been removed.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVideo();
    // Cleanup the blob URL when the component unmounts or the video changes
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.uuid, telegram]);
  
  useEffect(() => {
      setIsBookmarked(isInitiallyBookmarked)
  }, [isInitiallyBookmarked]);

  const handleBookmarkClick = async () => {
    telegram?.HapticFeedback.impactOccurred('light');
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState); // Optimistic update
    const success = await onBookmarkToggle(video.uuid, newBookmarkState);
    if (!success) {
      setIsBookmarked(!newBookmarkState); // Revert on failure
    }
  };
  
  const handleVideoClick = () => {
      if(videoRef.current) {
          if (videoRef.current.paused) {
              videoRef.current.play();
          } else {
              videoRef.current.pause();
          }
      }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 bg-black/30 rounded-full">
          <Icon name="close" className="w-6 h-6" />
        </button>
        <button onClick={handleBookmarkClick} className="p-2 bg-black/30 rounded-full">
          <Icon name={isBookmarked ? 'bookmark-filled' : 'bookmark'} className="w-6 h-6 text-telegram-button" />
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center relative" onClick={handleVideoClick}>
        {isLoading && <Loader message="Loading video..." />}
        {error && !isLoading && <ErrorMessage message={error} onRetry={fetchVideo} />}
        {videoUrl && !error && (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-full"
          />
        )}
      </div>

      {video.custom_caption && (
        <div className="p-4 bg-gradient-to-t from-black/50 to-transparent z-10">
          <p className="text-center">{video.custom_caption}</p>
        </div>
      )}
    </div>
  );
};
