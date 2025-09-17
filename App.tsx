import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './pages/HomePage';
import { SavedPage } from './pages/SavedPage';
import { ProfilePage } from './pages/ProfilePage';
import { BottomNav } from './components/BottomNav';
import { VideoPlayer } from './components/VideoPlayer';
import type { Video } from './types';
import { useTelegram } from './useTelegram';
import { api } from './services/api';
import { Loader } from './components/Loader';

type Page = 'home' | 'saved' | 'profile';

const App: React.FC = () => {
  const telegram = useTelegram();
  const [activePage, setActivePage] = useState<Page>('home');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [savedVideoUuids, setSavedVideoUuids] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  const fetchSavedUuids = useCallback(async () => {
    if (!telegram) return;
    try {
      const uuids = await api.get<string[]>('/saved', telegram.initData);
      setSavedVideoUuids(new Set(uuids));
    } catch (error) {
      console.error("Failed to fetch saved videos:", error);
      // Optionally show a toast notification to the user
    }
  }, [telegram]);

  useEffect(() => {
    if (telegram) {
      fetchSavedUuids().finally(() => setIsReady(true));
    }
  }, [telegram, fetchSavedUuids]);
  
  const handleBookmarkToggle = async (uuid: string, isBookmarked: boolean): Promise<boolean> => {
    if (!telegram) return false;
    try {
      await api.post('/bookmark', telegram.initData, { video_uuid: uuid });
      setSavedVideoUuids(prev => {
        const newSet = new Set(prev);
        if (isBookmarked) {
          newSet.add(uuid);
        } else {
          newSet.delete(uuid);
        }
        return newSet;
      });
      return true;
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      telegram.HapticFeedback.notificationOccurred('error');
      return false;
    }
  };

  const handleNavigate = (page: Page) => {
    telegram?.HapticFeedback.selectionChanged();
    setActivePage(page);
  };
  
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };
  
  if (!isReady) {
      return (
          <div className="h-full w-full flex items-center justify-center">
              <Loader message="Connecting..." />
          </div>
      )
  }

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onVideoSelect={handleVideoSelect} />;
      case 'saved':
        return <SavedPage onVideoSelect={handleVideoSelect} savedVideoUuids={savedVideoUuids} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onVideoSelect={handleVideoSelect} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <main className="flex-grow overflow-hidden">
        {renderCurrentPage()}
      </main>
      <BottomNav activePage={activePage} onNavigate={handleNavigate} />
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
          onBookmarkToggle={handleBookmarkToggle}
          isInitiallyBookmarked={savedVideoUuids.has(selectedVideo.uuid)}
        />
      )}
    </div>
  );
};

export default App;