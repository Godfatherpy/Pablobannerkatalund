import React, { useState, useEffect, useCallback } from 'react';
import { useTelegram } from '../useTelegram';
import { api } from '../services/api';
import type { Video, Category } from '../types';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { VideoCard } from '../components/VideoCard';

interface SavedPageProps {
  onVideoSelect: (video: Video) => void;
  savedVideoUuids: Set<string>; // Receive the set of saved UUIDs
}

export const SavedPage: React.FC<SavedPageProps> = ({ onVideoSelect, savedVideoUuids }) => {
  const telegram = useTelegram();
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllVideosAndFilter = useCallback(async () => {
    if (!telegram || savedVideoUuids.size === 0) {
      setIsLoading(false);
      setSavedVideos([]);
      return;
    };

    setIsLoading(true);
    setError(null);
    try {
      const categories = await api.get<Category[]>('/categories', telegram.initData);
      
      const videoPromises = categories.map(category =>
        api.get<Video[]>(`/feed/${category}`, telegram.initData)
          .then(videos => videos.map(v => ({ ...v, category }))) // Add category info
          .catch(e => {
            console.warn(`Could not load feed for category: ${category}`, e);
            return []; // Return empty array on failure to not break Promise.all
          })
      );
      
      const allVideosByCategory = await Promise.all(videoPromises);
      const allVideosFlat = allVideosByCategory.flat();
      
      const videoMap = new Map(allVideosFlat.map(v => [v.uuid, v]));
      
      // Filter videos based on the saved UUIDs
      const filteredVideos = Array.from(savedVideoUuids).map(uuid => videoMap.get(uuid)).filter(Boolean) as Video[];
      
      setSavedVideos(filteredVideos);
    } catch (e: any) {
      setError(e.message || "Failed to load saved videos.");
    } finally {
      setIsLoading(false);
    }
  }, [telegram, savedVideoUuids]);

  useEffect(() => {
    fetchAllVideosAndFilter();
  }, [fetchAllVideosAndFilter]);

  const renderContent = () => {
    if (isLoading) {
      return <Loader message="Loading Saved Videos..." />;
    }
    if (error) {
      return <ErrorMessage message={error} onRetry={fetchAllVideosAndFilter} />;
    }
    if (savedVideos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-telegram-hint p-4">
          <p className="text-lg">No Saved Videos</p>
          <p>You haven't bookmarked any videos yet. Find videos on the Home page and tap the bookmark icon to save them here!</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        {savedVideos.map(video => (
          <VideoCard key={video.uuid} video={video} onClick={() => onVideoSelect(video)} />
        ))}
      </div>
    );
  };

  return (
    <div className="pt-4 pb-16 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold px-4 mb-4">Saved Videos</h1>
      {renderContent()}
    </div>
  );
};
