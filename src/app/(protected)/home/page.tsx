"use client";

import { useSession, signIn } from 'next-auth/react';
import ClaimButton from '@/components/ClaimButton';
import { useState, useEffect } from 'react';
import Image from 'next/image'; // Impor Image dari next/image

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'claim' | 'about'>('claim');

  const hasClaimed = session?.user?.hasClaimed ?? false;

  const user = session?.user || {
    walletAddress: '0x0',
    username: 'Guest User',
    profilePictureUrl: '',
  };

  console.log('Session Status:', status);
  console.log('Session Data:', session);
  console.log('Wallet Address:', user.walletAddress);
  console.log('Current activeTab:', activeTab); // Debugging activeTab
  if (session) {
    console.log('Expires:', session.expires);
    console.log('Username:', session.user?.username);
    console.log('Has Claimed:', hasClaimed);
    const expiresDate = new Date(session.expires);
    const now = new Date();
    const timeUntilExpiry = expiresDate.getTime() - now.getTime();
    console.log('Time until session expires (ms):', timeUntilExpiry);
    if (timeUntilExpiry < 0) {
      console.warn('Session has expired!');
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && !session) {
      console.error('Session tidak ditemukan meskipun status authenticated');
    }
    if (status === 'unauthenticated') {
      console.warn('User is not authenticated');
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900 flex items-center justify-center">
        <p className="text-gray-300 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900 flex items-center justify-center">
        <p className="text-red-400 text-lg">
          Please log in to access this page.{' '}
          <button
            onClick={() => signIn('credentials')}
            className="text-blue-400 underline"
          >
            Log in now
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900 text-white font-sans flex flex-col justify-start">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 text-center border border-gray-700 shadow-xl mt-6 mb-20">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={user.profilePictureUrl || '/xdoge-logo.png'}
            alt="Profile or Xdoge"
            width={80} // Sesuaikan ukuran
            height={80}
            className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg animate-fade-in"
          />
          <p className="text-2xl font-bold text-white capitalize drop-shadow-md animate-fade-in">
            {user.username}
          </p>
          <p className="text-sm text-gray-400 break-all">{user.walletAddress}</p>
        </div>

        {user.walletAddress === '0x0' || !user.walletAddress ? (
          <p className="text-red-400 mt-4 animate-fade-in">
            Wallet address not detected. Please ensure your wallet is connected and authenticated.
          </p>
        ) : (
          <>
            {activeTab === 'claim' ? (
              <div className="flex flex-col items-center gap-4 mt-6 animate-fade-in">
                <ClaimButton walletAddress={user.walletAddress} userName={user.username} />
                {!hasClaimed && (
                  <p className="text-yellow-400">
                    You have not claimed your tokens yet. Click the button to claim.
                  </p>
                )}
              </div>
            ) : activeTab === 'about' ? (
              <div className="mt-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">About Xdoge</h2>
                <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                  Xdoge Mini App lets you claim XDOGE tokens every 7 days. Join our vibrant community, claim your tokens, and participate in our exclusive top holders rewards program!
                </p>
                <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                  Get XDOGE now.:
                </p>
                <div className="flex flex-col gap-4 w-full mt-4">
                  <a
                    href="https://worldcoin.org/mini-app?app_id=app_a4f7f3e62c1de0b9490a5260cb390b56&app_mode=mini-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-700 transition duration-300 flex items-center gap-2 transform hover:scale-105 text-base shadow-md"
                  >
                    Swap XDOGE on UNO
                  </a>
                  <a
                    href="https://worldcoin.org/mini-app?app_id=app_0d4b759921490adc1f2bd569fda9b53a&app_mode=mini-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-700 transition duration-300 flex items-center gap-2 transform hover:scale-105 text-base shadow-md"
                  >
                    XDOGE on HOLDSTATION
                  </a>
                  <a
                    href="https://accounts.bmwweb.me/register?ref=ZKO2JGYW&utm_medium=web_share_copy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 bg-blue-800 text-white rounded-full hover:bg-blue-700 transition duration-300 flex items-center gap-2 transform hover:scale-105 text-base shadow-md"
                  >
                    Buy Worldcoin
                  </a>
                </div>
                <div className="flex justify-center gap-6 mt-6">
                  <a
                    href="https://x.com/xdogeworld"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-400 transition duration-300"
                    title="X"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>
            ) : null}

            <div className="fixed bottom-0 left-0 w-full flex justify-center gap-4 p-4 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 shadow-lg">
              <button
                onClick={() => {
                  console.log('Setting activeTab to claim');
                  setActiveTab('claim');
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-300 w-1/2 max-w-[200px] transform hover:scale-105 ${
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
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-300 w-1/2 max-w-[200px] transform hover:scale-105 ${
                  activeTab === 'about' ? 'bg-blue-800 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                About
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}