'use client';

import { walletAuth } from '@/auth/wallet';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useCallback, useEffect, useState } from 'react';

type AuthButtonProps = {
  onError?: () => void;
};

export const AuthButton = ({ onError }: AuthButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<'pending' | 'success' | 'failed' | undefined>(undefined);
  const { isInstalled } = useMiniKit();
  const [isMounted, setIsMounted] = useState(false); // Tambahkan untuk pengecekan hydrasi

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onClick = useCallback(async () => {
    if (!isInstalled || isPending || !isMounted) {
      return;
    }
    setIsPending(true);
    setState('pending');
    try {
      await walletAuth();
      setState('success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Wallet authentication button error:', errorMessage);
      setState('failed');
      if (onError) onError();
    } finally {
      setIsPending(false);
      setTimeout(() => setState(undefined), 2000);
    }
  }, [isInstalled, isPending, isMounted, onError]);

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
        disabled={isPending || !isInstalled || !isMounted}
        size="lg"
        variant="primary"
      >
        {isInstalled ? 'Login with Wallet' : 'MiniKit Not Installed'}
      </Button>
    </LiveFeedback>
  );
};