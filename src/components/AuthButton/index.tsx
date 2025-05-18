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
  const [hasAttemptedAutoAuth, setHasAttemptedAutoAuth] = useState(false);
  const [authFailureCount, setAuthFailureCount] = useState(0);

  const onClick = useCallback(async () => {
    if (!isInstalled || isPending) {
      return;
    }
    setIsPending(true);
    setState('pending');
    try {
      await walletAuth();
      setState('success');
      setAuthFailureCount(0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Wallet authentication button error:', errorMessage);
      setState('failed');
      setAuthFailureCount((prev) => prev + 1);
      if (onError) onError();
    } finally {
      setIsPending(false);
      setTimeout(() => setState(undefined), 2000);
    }
  }, [isInstalled, isPending, onError]);

  useEffect(() => {
    const authenticate = async () => {
      if (isInstalled && !isPending && !hasAttemptedAutoAuth && authFailureCount < 2) {
        setIsPending(true);
        setState('pending');
        try {
          await walletAuth();
          setState('success');
          setAuthFailureCount(0);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error('Auto wallet authentication error:', errorMessage);
          setState('failed');
          setAuthFailureCount((prev) => prev + 1);
          if (onError) onError();
        } finally {
          setIsPending(false);
          setHasAttemptedAutoAuth(true);
          setTimeout(() => setState(undefined), 2000);
        }
      }
    };

    authenticate();
  }, [isInstalled, isPending, onError, hasAttemptedAutoAuth, authFailureCount]);

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
        disabled={isPending || !isInstalled}
        size="lg"
        variant="primary"
      >
        {isInstalled ? 'Login with Wallet' : 'MiniKit Not Installed'}
      </Button>
    </LiveFeedback>
  );
};