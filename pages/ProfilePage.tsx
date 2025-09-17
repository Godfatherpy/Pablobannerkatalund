import React, { useState, useEffect } from 'react';
import { useTelegram } from '../useTelegram';
import { api } from '../services/api';
import type { UserProfile } from '../types';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Icon } from '../components/icons';

export const ProfilePage: React.FC = () => {
  const telegram = useTelegram();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!telegram) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<UserProfile>('/profile', telegram.initData);
      setProfile(data);
    } catch (e: any) {
      setError(e.message || "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (telegram) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegram]);

  const renderContent = () => {
    if (isLoading) {
      return <Loader message="Loading Profile..." />;
    }
    if (error) {
      return <ErrorMessage message={error} onRetry={fetchProfile} />;
    }
    if (profile) {
      const isPremium = profile.status === 'Premium';
      return (
        <div className="p-4 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${isPremium ? 'bg-yellow-400' : 'bg-telegram-button'}`}>
                <Icon name="profile" className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{telegram?.initDataUnsafe.user?.first_name || 'User'}</h1>
            <span className={`px-3 py-1 mt-2 rounded-full text-sm font-semibold ${isPremium ? 'bg-yellow-400/20 text-yellow-300' : 'bg-telegram-button/20 text-telegram-button'}`}>
                {profile.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-telegram-secondary-bg p-4 rounded-lg">
                  <p className="text-2xl font-bold">{profile.tokens}</p>
                  <p className="text-telegram-hint text-sm">Active Tokens</p>
              </div>
              <div className="bg-telegram-secondary-bg p-4 rounded-lg">
                  <p className="text-2xl font-bold">{profile.referrals}</p>
                  <p className="text-telegram-hint text-sm">Referrals</p>
              </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pt-4 pb-16 h-full overflow-y-auto">
      {renderContent()}
    </div>
  );
};
