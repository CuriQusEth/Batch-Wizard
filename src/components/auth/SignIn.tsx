import { useState } from 'react';
import { createSiweMessage, generateSiweNonce } from 'viem/siwe';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export function SignIn({ onSignIn }: { onSignIn?: () => void }) {
  const { address, chainId, isConnected } = useAccount();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();

  async function handleSignIn() {
    if (!isConnected || !address || !chainId || !publicClient) {
      throw new Error('Connect your wallet before signing in');
    }

    setIsSigningIn(true);
    const nonce = generateSiweNonce();

    try {
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: '1',
      });

      const signature = await signMessageAsync({ account: address, message });

      const valid = await publicClient.verifySiweMessage({ message, signature });
      if (!valid) throw new Error('SIWE verification failed');
      
      // In a real app, you would send the signature to your backend here
      // and receive a session cookie/token. For now, we'll just call the callback.
      if (onSignIn) onSignIn();
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignIn}
      disabled={!isConnected || isSigningIn}
      className="gap-2"
    >
      {isSigningIn && <Loader2 className="w-4 h-4 animate-spin" />}
      {isSigningIn ? 'Signing in...' : 'Sign in with Ethereum'}
    </Button>
  );
}
