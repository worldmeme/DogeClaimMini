'use client';

import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';
import ClaimButton from '@/components/ClaimButton';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MiniKit } from '@worldcoin/minikit-js';

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'claim' | 'about'>('claim');
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (MiniKit.isInstalled() && status === 'authenticated') {
        try {
          const wallet = await MiniKit.commandsAsync.getWalletAddress();
          if (wallet.status === 'success') {
            setWalletAddress(wallet.address);
            console.log('Wallet detected via MiniKit:', wallet.address);
          } else {
            console.error('Failed to fetch wallet address via MiniKit:', wallet);
            setWalletAddress(null);
          }
        } catch (error) {
          console.error('Error fetching wallet address:', error);
          setWalletAddress(null);
        }
      }
    };
    fetchWalletAddress();
  }, [status]);

  useEffect(() => {
    console.log('Current Status:', status);
    console.log('Session:', session);
    if (status === 'authenticated' && session) {
      console.log('Wallet Address (using id):', session?.user?.id);
      console.log('Wallet Address (MiniKit):', walletAddress);
      console.log('Expires:', session?.expires);
      console.log('User Verified:', session?.user?.verified || 'Not available');
      console.log('Active Tab (useEffect):', activeTab);
      setActiveTab('claim');
    } else if (status === 'unauthenticated') {
      console.log('User unauthenticated, resetting activeTab');
      setActiveTab('claim');
    }
  }, [status, session, walletAddress]);

  useEffect(() => {
    if (status === 'authenticated' && window.location.pathname !== '/') {
      console.log('Redirecting to / to ensure proper rendering');
      router.replace('/');
    }
  }, [status, router]);

  if (!isMounted) {
    return null;
  }

  const user = session?.user || {
    id: '0x0',
    username: 'Guest User',
    profilePictureUrl: '',
  };

  if (status === 'loading') {
    console.log('Rendering Loading State');
    return (
      <Page>
        <Page.Main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900">
          <p className="text-gray-300 text-lg md:text-xl lg:text-2xl animate-pulse">Loading...</p>
        </Page.Main>
      </Page>
    );
  }

  if (status === 'unauthenticated' || user.id === '0x0') {
    console.log('Rendering Unauthenticated State');
    return (
      <Page>
        <Page.Main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900 text-white font-sans">
          {error && (
            <p className="text-red-500 text-base md:text-lg mb-4 animate-fade-in">
              {error}
            </p>
          )}
          <img
            src="/xdoge-logo.png"
            alt="xdoge-logo"
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-4 animate-bounce"
          />
          <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">Xdoge App</p>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 mt-2 animate-fade-in">Xdoge Meme on Worldchain</p>
          <AuthButton onError={() => setError('Network error during login')} />
        </Page.Main>
      </Page>
    );
  }

  console.log('Rendering Authenticated State with activeTab:', activeTab);
  return (
    <Page>
      <div
        suppressHydrationWarning
        className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900 text-white font-sans"
      >
        <div className="flex-1 flex flex-col justify-start w-full px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-3xl mx-auto bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 md:p-8 lg:p-10 text-center border border-gray-700 shadow-xl mt-6 mb-20">
            <div className="flex flex-col items-center gap-4">
              <img
                src={user.profilePictureUrl || '/xdoge-logo.png'}
                alt="Profile or Xdoge"
                className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full mb-2 border-4 border-blue-500 shadow-lg animate-fade-in"
              />
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white capitalize drop-shadow-md animate-fade-in">
                Welcome, {user.username}!
              </p>
              <p className="text-sm md:text-base lg:text-lg text-gray-400 break-all">{walletAddress || user.id}</p>
            </div>

            <div className="mt-6 w-full">
              {activeTab === 'claim' ? (
                <div className="flex flex-col items-center gap-4 w-full animate-fade-in">
                  <ClaimButton walletAddress={walletAddress || user.id} userName={user.username} />
                </div>
              ) : activeTab === 'about' ? (
                <div className="animate-fade-in">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-md">About Xdoge</h2>
                  <p className="text-sm md:text-base lg:text-lg text-gray-300 mt-3 leading-relaxed">
                    Xdoge Mini App lets you claim XDOGE tokens every 7 days. Join our vibrant community, claim your tokens, and participate in our exclusive top holders rewards program!
                  </p>
                  <p className="text-sm md:text-base lg:text-lg text-gray-300 mt-3 leading-relaxed">
                    Explore more on our markets:
                  </p>
                  <div className="flex flex-col md:flex-row justify-center gap-4 w-full mt-4">
                    <a
                      href="https://uno.worldcoin.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-700 transition duration-300 flex items-center gap-2 transform hover:scale-105 text-base md:text-lg lg:text-xl shadow-md"
                    >
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h18M3 7h18M3 12h18m-6 5h6"
                        />
                      </svg>
                      UNO
                    </a>
                    <a
                      href="https://holdstation.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-700 transition duration-300 flex items-center gap-2 transform hover:scale-105 text-base md:text-lg lg:text-xl shadow-md"
                    >
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h18M3 7h18M3 12h18m-6 5h6"
                        />
                      </svg>
                      HOLDSTATION
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-red-500">Invalid Tab State: {activeTab}</p>
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full flex justify-center gap-4 p-4 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 shadow-lg">
          <button
            onClick={() => {
              console.log('Setting activeTab to claim');
              setActiveTab('claim');
            }}
            className={`px-4 py-2 text-sm md:text-base lg:text-lg font-semibold rounded-lg transition duration-300 w-1/2 max-w-[200px] transform hover:scale-105 ${
              activeTab === 'claim' ? 'bg-blue-800 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Claim
          </button>
          <button
            onClick={() => {
              console.log('Setting activeTab to about');
              setActiveTab('about');
            }}
            className={`px-4 py-2 text-sm md:text-base lg:text-lg font-semibold rounded-lg transition duration-300 w-1/2 max-w-[200px] transform hover:scale-105 ${
              activeTab === 'about' ? 'bg-blue-800 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            About
          </button>
        </div>
      </div>
    </Page>
  );
}
