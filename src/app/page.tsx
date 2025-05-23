'use client';

import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';
import ClaimButton from '@/components/ClaimButton';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'claim' | 'about'>('claim');
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      setActiveTab('claim');
    } else if (status === 'unauthenticated') {
      setActiveTab('claim');
    }
  }, [status, session]);

  const shareInvitation = () => {
    const referralLink = `https://worldcoin.org/mini-app?app_id=app_a7089acf6de8bed630edea05e372db3c&app_mode=mini-app`;
    const textToCopy = `Get DCMINI for free, where you can claim it every 7 days at no cost! Click the link: ${referralLink}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('The invitation link and text have been copied to the clipboard!');
    }).catch(err => {
      alert('Failed to copy the text.');
      console.error(err);
    });
  };

  if (!isMounted) {
    return null;
  }

  const user = session?.user || {
    id: '0x0',
    username: 'Guest User',
    profilePictureUrl: '',
  };

  if (status === 'loading') {
    return (
      <Page>
        <Page.Main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900">
          <p className="text-gray-300 text-lg md:text-xl lg:text-2xl animate-pulse">Loading...</p>
        </Page.Main>
      </Page>
    );
  }

  if (status === 'unauthenticated' || user.id === '0x0') {
    return (
      <Page>
        <Page.Main className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900 text-white font-sans">
          {error && (
            <p className="text-red-500 text-base md:text-lg mb-4 animate-fade-in">
              {error}
            </p>
          )}
          <Image
            src="/dogeclaimmini.png"
            alt="dogeclaimmini"
            width={192}
            height={192}
            className="mb-4 animate-bounce"
          />
          <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">DogeClaimMini</p>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 mt-2 animate-fade-in">DogeClaimMini is a fun mini app built for the Worldcoin ecosystem</p>
          <AuthButton onError={() => setError('Authentication failed. Please try again or install the Worldcoin app.')} />
        </Page.Main>
      </Page>
    );
  }

  return (
    <Page>
      <div
        suppressHydrationWarning
        className="flex flex-col items-center min-h-screen w-full bg-gradient-to-b from-purple-900 to-blue-900 text-white font-sans"
      >
        <div className="flex-1 flex flex-col justify-start w-full px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-3xl mx-auto bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 md:p-8 lg:p-10 text-center border border-gray-700 shadow-xl mt-6 mb-20">
            <div className="flex flex-col items-center gap-4">
              <Image
                src={user.profilePictureUrl || '/dogeclaimmini.png'}
                alt="Profile or dogeclaimmini"
                width={112}
                height={112}
                className="rounded-full mb-2 border-4 border-blue-500 shadow-lg animate-fade-in"
              />
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white capitalize drop-shadow-md animate-fade-in">
                Welcome, {user.username}!
              </p>
              <p className="text-sm md:text-base lg:text-lg text-gray-400 break-all">{user.id}</p>
            </div>

            <div className="mt-6 w-full">
              {activeTab === 'claim' ? (
                <div className="flex flex-col items-center gap-4 w-full animate-fade-in">
                  <ClaimButton walletAddress={user.id ?? '0x0'} userName={user.username ?? 'Guest User'} />
                </div>
              ) : activeTab === 'about' ? (
                <div className="animate-fade-in">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-md">About DCMINI</h2>
                  <p className="text-sm md:text-base lg:text-lg text-gray-300 mt-3 leading-relaxed">
                    DogeClaimMini is a fun mini app built for the Worldcoin ecosystem, allowing you to claim DCMINI tokens every 7 days with a community-driven twist! Join our vibrant community, earn exclusive rewards, and stay tuned for exciting updates.
                  </p>
                  <p className="text-sm md:text-base lg:text-lg text-gray-300 mt-3 leading-relaxed">
                    Buy and Sell DCMINI:
                  </p>
                  <div className="flex flex-col md:flex-row justify-center gap-4 w-full mt-4">
                    <a
                      href="https://worldcoin.org/mini-app?app_id=app_a4f7f3e62c1de0b9490a5260cb390b56&app_mode=mini-app"
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
                      DCMINI Swap on UNO
                    </a>
                    <a
                      href="https://worldcoin.org/mini-app?app_id=app_0d4b759921490adc1f2bd569fda9b53a&app_mode=mini-app"
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
                      DCMINI Swap on HOLDSTATION
                    </a>
                    <a
                      href="https://accounts.bmwweb.me/register?ref=ZKO2JGYW"
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
                      Buy WLD Worldcoin
                    </a>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={shareInvitation}
                      className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-300"
                    >
                      Share the Invitation with Friends
                    </button>
                    <a
                      href="https://x.com/xdogeworld"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition duration-300 mt-2"
                    >
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Follow us on X
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
            onClick={() => setActiveTab('claim')}
            className={`px-4 py-2 text-sm md:text-base lg:text-lg font-semibold rounded-lg transition duration-300 w-1/2 max-w-[200px] transform hover:scale-105 ${
              activeTab === 'claim' ? 'bg-blue-800 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Claim
          </button>
          <button
            onClick={() => setActiveTab('about')}
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