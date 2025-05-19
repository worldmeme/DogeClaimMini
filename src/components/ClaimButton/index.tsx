"use client";

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import xdogeAbi from '@/abi/xdoge.json';
import Image from 'next/image';

export default function ClaimButton({ walletAddress, userName }: { walletAddress: string; userName?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [buttonState, setButtonState] = useState<'pending' | 'success' | 'failed' | undefined>(undefined);
  const [transactionId, setTransactionId] = useState<string>('');
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0);
  const [timer, setTimer] = useState<string>('0 days 0 hours 0 minutes 0 seconds');
  const [balance, setBalance] = useState<string>('0');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verifyState, setVerifyState] = useState<'pending' | 'success' | 'failed' | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const xdogeAddress = process.env.NEXT_PUBLIC_XDOGE_ADDRESS || '0xYourXdogeAddress';
  const rpcUrl = 'https://worldchain-mainnet.g.alchemy.com/public';

  // Bungkus provider dengan useMemo
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcUrl), [rpcUrl]);

  // Bungkus contract dengan useMemo
  const contract = useMemo(() => new ethers.Contract(xdogeAddress, xdogeAbi, provider), [xdogeAddress, provider]);

  // Bungkus fungsi dengan useCallback
  const fetchBalance = useCallback(async () => {
    if (!walletAddress || walletAddress === '0x0') {
      console.warn('Wallet address is invalid for balance check:', walletAddress);
      setBalance('0');
      return;
    }

    try {
      const balanceBigInt = await contract.balanceOf(walletAddress);
      const balanceInTokens = ethers.formatUnits(balanceBigInt, 18);
      const newBalance = parseFloat(balanceInTokens).toFixed(2);
      setBalance(newBalance);
      console.log('Fetched balance:', newBalance, 'for wallet:', walletAddress);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error fetching balance:', errorMsg, 'for wallet:', walletAddress);
      setBalance('0');
    }
  }, [walletAddress, contract]);

  const checkTimeUntilNextClaim = useCallback(async () => {
    if (!walletAddress || walletAddress === '0x0') {
      console.warn('Wallet address is invalid for time check:', walletAddress);
      setTimeUntilNextClaim(0);
      localStorage.setItem('timeUntilNextClaim', '0');
      return;
    }

    try {
      const result = await contract.getTimeUntilNextMint(walletAddress);
      const time = Number(result);
      console.log('Time until next claim from contract:', time, 'seconds for wallet:', walletAddress);
      if (time > 0) {
        setTimeUntilNextClaim(time);
        localStorage.setItem('timeUntilNextClaim', time.toString());
      } else {
        setTimeUntilNextClaim(0);
        localStorage.setItem('timeUntilNextClaim', '0');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error checking time until next claim:', errorMsg, 'for wallet:', walletAddress);
      setTimeUntilNextClaim(0);
      localStorage.setItem('timeUntilNextClaim', '0');
    }
  }, [walletAddress, contract]);

  // Initialize state from localStorage and fetch initial data
  useEffect(() => {
    const init = async () => {
      if (!walletAddress || walletAddress === '0x0') {
        console.warn('Wallet address is invalid:', walletAddress);
        return;
      }

      const savedTimeUntilNextClaim = localStorage.getItem('timeUntilNextClaim');
      if (savedTimeUntilNextClaim) setTimeUntilNextClaim(parseInt(savedTimeUntilNextClaim, 10));

      await checkTimeUntilNextClaim();
      await fetchBalance();
    };

    init();
  }, [walletAddress, checkTimeUntilNextClaim, fetchBalance]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (walletAddress && walletAddress !== '0x0') {
        checkTimeUntilNextClaim();
        fetchBalance();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [walletAddress, checkTimeUntilNextClaim, fetchBalance]);

  useEffect(() => {
    if (transactionId) {
      const interval = setInterval(async () => {
        try {
          const receipt = await provider.getTransactionReceipt(transactionId);
          if (receipt) {
            clearInterval(interval);
            if (receipt.status === 1) {
              console.log('Transaction confirmed! Transaction ID:', transactionId);
              setButtonState('success');
              setTimeUntilNextClaim(604800); // 7 days cooldown as fallback
              localStorage.setItem('timeUntilNextClaim', '604800');
              fetchBalance();
              checkTimeUntilNextClaim();
              setTimeout(() => {
                setButtonState(undefined);
                setIsLoading(false);
              }, 3000);
            } else {
              console.error('Transaction failed for Transaction ID:', transactionId);
              setButtonState('failed');
              setTimeout(() => {
                setButtonState(undefined);
                setIsLoading(false);
              }, 3000);
            }
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error('Error polling transaction receipt:', errorMsg);
          clearInterval(interval);
          setButtonState('failed');
          setTimeout(() => {
            setButtonState(undefined);
            setIsLoading(false);
          }, 3000);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [transactionId, fetchBalance, checkTimeUntilNextClaim, provider]); // Tambahkan provider ke dependensi

  useEffect(() => {
    if (timeUntilNextClaim > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeUntilNextClaim((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            checkTimeUntilNextClaim();
            return 0;
          }
          const newTime = prev - 1;
          localStorage.setItem('timeUntilNextClaim', newTime.toString());
          return newTime;
        });
      }, 1000);
    }

    const days = Math.floor(timeUntilNextClaim / (3600 * 24));
    const hours = Math.floor((timeUntilNextClaim % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeUntilNextClaim % 3600) / 60);
    const seconds = timeUntilNextClaim % 60;
    setTimer(`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeUntilNextClaim, checkTimeUntilNextClaim]);

  const handleVerifyWorldId = async () => {
    if (!MiniKit.isInstalled()) {
      console.error('MiniKit is not installed');
      return;
    }

    setVerifyState('pending');
    try {
      const result = await MiniKit.commandsAsync.verify({
        action: 'claim-xdoge',
        verification_level: VerificationLevel.Orb,
      });
      console.log('Verify result:', result.finalPayload);

      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        body: JSON.stringify({
          payload: result.finalPayload,
          action: 'claim-xdoge',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server response:', data);
      if (data.verifyRes && data.verifyRes.success) {
        setVerifyState('success');
        setIsVerified(true);
        console.log('World ID verification successful');
      } else {
        throw new Error('Verification failed on server');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error during World ID verification:', errorMsg);
      setVerifyState('failed');
      setTimeout(() => {
        setVerifyState(undefined);
      }, 2000);
    }
  };

  const handleClaim = async () => {
    if (!walletAddress || walletAddress === '0x0') {
      console.error('Cannot proceed with claim: Wallet address is invalid:', walletAddress);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 3000);
      return;
    }

    setIsLoading(true);
    setButtonState('pending');
    setTransactionId('');

    if (timeUntilNextClaim > 0) {
      console.log('Claim delayed, waiting:', timeUntilNextClaim, 'seconds');
      setIsLoading(false);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 3000);
      return;
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: xdogeAddress,
            abi: xdogeAbi,
            functionName: 'claim',
            args: [],
          },
        ],
      });

      if (finalPayload.status === 'success') {
        console.log('Transaction submitted, waiting for confirmation:', finalPayload.transaction_id);
        setTransactionId(finalPayload.transaction_id);
      } else {
        console.error('Transaction submission failed:', finalPayload);
        setButtonState('failed');
        setIsLoading(false);
        setTimeout(() => setButtonState(undefined), 3000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error during claim process:', errorMsg);
      setButtonState('failed');
      setIsLoading(false);
      setTimeout(() => setButtonState(undefined), 3000);
    }
  };

  const handleAction = async () => {
    if (!isVerified) {
      await handleVerifyWorldId();
    } else {
      await handleClaim();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-xl">
      <div className="flex items-center gap-2 mb-4 mt-4">
        {userName && (
          <p className="text-xl md:text-2xl font-bold text-white capitalize animate-fade-in">{userName}</p>
        )}
        <Image src="/xdoge-logo.png" alt="Xdoge Logo" width={40} height={40} className="animate-spin-slow" />
      </div>
      <p className="text-xl md:text-2xl font-bold text-white">{timer}</p>
      {timeUntilNextClaim > 0 ? (
        <p className="text-sm md:text-base text-gray-300">You can claim again in: {timer}</p>
      ) : (
        <p className="text-sm md:text-base text-gray-300">{isVerified ? 'Claim Available!' : 'Verify World ID to Claim'}</p>
      )}
      <LiveFeedback
        label={{
          failed: isVerified ? 'Failed to Claim' : 'Failed to Verify',
          pending: isVerified ? 'Claiming...' : 'Verifying...',
          success: isVerified ? 'Claimed!' : 'Verified!',
        }}
        state={isVerified ? buttonState : verifyState}
        className="w-full max-w-xs mx-auto"
      >
        <Button
          onClick={handleAction}
          disabled={isLoading || timeUntilNextClaim > 0}
          className="w-full max-w-xs mx-auto px-8 py-3 font-bold text-xl md:text-2xl bg-blue-800 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          {isLoading
            ? 'Processing...'
            : timeUntilNextClaim > 0
            ? 'Wait'
            : 'CLAIM'}
        </Button>
      </LiveFeedback>
      <p className="text-base md:text-lg text-white">Balance: {balance} XDOGE</p>
      <div className="mt-4 text-center">
        <p className="text-lg md:text-xl font-semibold text-white">Reward Top Holders</p>
        <div className="mt-2 space-y-1 text-gray-300">
          <p className="text-sm md:text-base">1 - 10: <span className="font-semibold text-green-400">500 XDOGE</span></p>
          <p className="text-sm md:text-base">11 - 50: <span className="font-semibold text-green-400">250 XDOGE</span></p>
          <p className="text-sm md:text-base">51 - 100: <span className="font-semibold text-green-400">100 XDOGE</span></p>
          <p className="text-sm md:text-base">101 - 250: <span className="font-semibold text-green-400">50 XDOGE</span></p>
          <p className="text-sm md:text-base">251 - 500: <span className="font-semibold text-green-400">25 XDOGE</span></p>
        </div>
        <p className="mt-2 text-xs md:text-sm text-gray-500">Next reward distribution date: July 1, 2025</p>
      </div>
    </div>
  );
}