/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './config/wagmi';
import { Header } from './components/layout/Header';
import { ActionSelector } from './components/wizard/ActionSelector';
import { ActionConfig } from './components/wizard/ActionConfig';
import { BatchQueue } from './components/wizard/BatchQueue';
import { SimulationPanel } from './components/wizard/SimulationPanel';
import { useState } from 'react';
import { ActionType } from './store/useBatchStore';

const queryClient = new QueryClient();

export default function App() {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-slate-950 font-sans text-slate-50">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center max-w-2xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl mb-4">
                Compose. Simulate. Execute.
              </h1>
              <p className="text-lg text-slate-400">
                Build complex multi-step transactions on Base and execute them with a single signature. Save gas and time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Builder */}
              <div className="lg:col-span-8 space-y-6">
                {!selectedAction ? (
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-slate-100">1. Select Action</h2>
                    <ActionSelector onSelect={setSelectedAction} />
                  </div>
                ) : (
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-slate-100">2. Configure Action</h2>
                    <ActionConfig 
                      type={selectedAction} 
                      onCancel={() => setSelectedAction(null)} 
                      onSave={() => setSelectedAction(null)} 
                    />
                  </div>
                )}
                
                <SimulationPanel />
              </div>

              {/* Right Column: Queue */}
              <div className="lg:col-span-4 h-[calc(100vh-12rem)] sticky top-24">
                <BatchQueue />
              </div>
            </div>
          </main>
          
          <footer className="border-t border-slate-800 bg-slate-950 mt-12 py-8 text-center text-slate-500 text-sm">
            <div className="container mx-auto px-4">
              <p>Batch Wizard &copy; 2026. Built for the Base ecosystem.</p>
              <p className="mt-2 text-xs opacity-75">Not audited. Use at your own risk.</p>
            </div>
          </footer>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
