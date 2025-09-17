
import React, { useState, useEffect, useCallback } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { api } from '../services/api';
import type { Video, Category } from '../types';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { VideoCard } from '../components/VideoCard';

interface HomePageProps {
  onVideoSelect: (video: Video) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onVideoSelect }) => {
  const telegram = useTelegram();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<'categories' | 'videos' | false>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!telegram) return;
    setIsLoading('categories');
    setError(null);
    try {
      const data = await api.get<Category[]>('/categories', telegram.initData);
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0]);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [telegram]);

  const fetchVideos = useCallback(async (category: string) => {
    if (!telegram) return;
    setIsLoading('videos');
    setError(null);
    setVideos([]);
    try {
      const data = await api.get<Video[]>(`/feed/${category}`, telegram.initData);
      setVideos(data.map(v => ({...v, category})));
    } catch (e: any) {
      setError(e.message || `Failed to load videos for ${category}.`);
    } finally {
      setIsLoading(false);
    }
  }, [telegram]);

  useEffect(() => {
    if (telegram) {
      fetchCategories();
    }
  }, [telegram, fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchVideos(selectedCategory);
    }
  }, [selectedCategory, fetchVideos]);

  const renderContent = () => {
    if (isLoading === 'categories') {
      return <Loader message="Loading Categories..." />;
    }
    if (error && !categories.length) {
      return <ErrorMessage message={error} onRetry={fetchCategories} />;
    }
    
    return (
      <>
        <div className="p-2 sticky top-0 bg-telegram-bg z-10">
          {/* Fix: Replaced '-ms-overflow-style' with 'msOverflowStyle' to comply with React's camelCase style properties. */}
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-telegram-button text-telegram-button-text' : 'bg-telegram-secondary-bg text-telegram-text'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading === 'videos' && <div className="mt-8"><Loader message={`Loading ${selectedCategory} videos...`}/></div>}
        {error && videos.length === 0 && <div className="mt-8"><ErrorMessage message={error} onRetry={() => selectedCategory && fetchVideos(selectedCategory)} /></div>}
        
        <div className="grid grid-cols-2 gap-2 p-2">
          {videos.map(video => (
            <VideoCard key={video.uuid} video={video} onClick={() => onVideoSelect(video)} />
          ))}
        </div>
         {videos.length === 0 && !isLoading && !error && (
            <div className="col-span-2 text-center text-telegram-hint mt-8">
                <p>No videos in this category yet.</p>
            </div>
        )}
      </>
    );
  };

  return (
    <div className="pt-2 pb-16 h-full overflow-y-auto">
      {renderContent()}
    </div>
  );
};
