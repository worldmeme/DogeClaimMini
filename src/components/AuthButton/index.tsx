'use client';

import { walletAuth } from '@/auth/wallet';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useCallback, useEffect, useState } from 'react';

// Definisikan tipe untuk props
type AuthButtonProps = {
  onError?: () => void;
};

export const AuthButton = ({ onError }: AuthButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<'pending' | 'success' | 'failed' | undefined>(undefined); // Tambahkan state untuk feedback
  const { isInstalled } = useMiniKit();

  const onClick = useCallback(async () => {
    if (!isInstalled || isPending) {
      return;
    }
    setIsPending(true);
    setState('pending');
    try {
      await walletAuth();
      setState('success');
    } catch (error) {
      console.error('Wallet authentication button error', error);
      setState('failed');
      if (onError) onError(); // Panggil onError jika ada
    } finally {
      setIsPending(false);
      setTimeout(() => setState(undefined), 2000); // Reset state setelah 2 detik
    }
  }, [isInstalled, isPending, onError]);

  useEffect(() => {
    const authenticate = async () => {
      if (isInstalled && !isPending) {
        setIsPending(true);
        setState('pending');
        try {
          await walletAuth();
          setState('success');
        } catch (error) {
          console.error('Auto wallet authentication error', error);
          setState('failed');
          if (onError) onError(); // Panggil onError jika ada
        } finally {
          setIsPending(false);
          setTimeout(() => setState(undefined), 2000);
        }
      }
    };

    authenticate();
  }, [isInstalled, isPending, onError]);

  return (
    <LiveFeedback
      label={{
        failed: 'Failed to login',
        pending: 'Logging in',
        success: 'Logged in',
      }}
      state={state}
    >
      <Button
        onClick={onClick}
        disabled={isPending}
        size="lg"
        variant="primary"
      >
        Login with Wallet
      </Button>
    </LiveFeedback>
  );
};