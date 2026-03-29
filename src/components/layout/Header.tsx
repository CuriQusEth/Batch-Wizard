import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '../ui/button';
import { Layers, Wallet } from 'lucide-react';
import { SignIn } from '../auth/SignIn';
import { OneTapPayment } from '../payment/OneTapPayment';

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Batch Wizard
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <OneTapPayment />
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-slate-800 rounded-full text-sm font-medium text-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              {!isAuthenticated ? (
                <SignIn onSignIn={() => setIsAuthenticated(true)} />
              ) : (
                <span className="text-sm font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded">
                  Signed In
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => {
                disconnect();
                setIsAuthenticated(false);
              }}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={() => connect({ connector: connectors[0] })} className="gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
