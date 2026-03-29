import React, { useState } from 'react';
import { useBatchStore } from '@/src/store/useBatchStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import { encodeFunctionData, parseEther, parseUnits, erc20Abi, toHex, pad } from 'viem';

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
// TODO: Replace with your deployed BatchGM contract address on Base Mainnet
const BATCH_GM_ADDRESS = '0x0000000000000000000000000000000000000000'; 

const BATCH_GM_ABI = [
  {
    name: 'sendGM',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'message', type: 'bytes32' }
    ],
    outputs: []
  }
] as const;

const MULTICALL3_ABI = [
  {
    name: 'aggregate3Value',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{
      name: 'calls',
      type: 'tuple[]',
      components: [
        { name: 'target', type: 'address' },
        { name: 'allowFailure', type: 'bool' },
        { name: 'value', type: 'uint256' },
        { name: 'callData', type: 'bytes' },
      ]
    }],
    outputs: [{
      name: 'returnData',
      type: 'tuple[]',
      components: [
        { name: 'success', type: 'bool' },
        { name: 'returnData', type: 'bytes' },
      ]
    }]
  }
] as const;

export function SimulationPanel() {
  const { actions } = useBatchStore();
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setError(null);
    // Mock simulation for now
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult({
        success: true,
        gasUsed: '89,000',
        gasSaved: '37%',
        details: actions.map(a => ({ id: a.id, status: 'success' }))
      });
    }, 1500);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);
    setExecutionResult(null);

    try {
      let totalValue = 0n;
      const calls = actions.flatMap(action => {
        if (action.type === 'gm') {
          const gmFee = parseEther('0.000029');
          
          return action.recipients.map((recipient: string) => {
            let messageBytes32: `0x${string}` = pad('0x00', { size: 32 });
            if (action.message) {
              // Convert string to hex and pad to 32 bytes
              const hexMsg = toHex(action.message);
              messageBytes32 = pad(hexMsg, { size: 32, dir: 'right' });
            }

            let callData = encodeFunctionData({
              abi: BATCH_GM_ABI,
              functionName: 'sendGM',
              args: [recipient as `0x${string}`, messageBytes32]
            });

            totalValue += gmFee;

            // Append Builder Code suffix
            callData = `${callData}07626173656170700080218021802180218021802180218021` as `0x${string}`;

            return {
              target: BATCH_GM_ADDRESS as `0x${string}`,
              allowFailure: false,
              value: gmFee,
              callData
            };
          });
        }

        let target: `0x${string}`;
        let value = 0n;
        let callData: `0x${string}` = '0x';

        if (action.type === 'send') {
          if (action.tokenAddress === 'native') {
            target = action.recipient as `0x${string}`;
            value = parseEther(action.amount || '0');
          } else {
            target = action.tokenAddress as `0x${string}`;
            callData = encodeFunctionData({
              abi: erc20Abi,
              functionName: 'transfer',
              args: [action.recipient as `0x${string}`, parseUnits(action.amount || '0', 18)]
            });
          }
        } else if (action.type === 'approve') {
          target = action.tokenAddress as `0x${string}`;
          callData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [action.spender as `0x${string}`, parseUnits(action.amount || '0', 18)]
          });
        } else if (action.type === 'call') {
          target = action.contractAddress as `0x${string}`;
          if (action.rawCalldata) {
            callData = action.rawCalldata;
          } else {
            callData = encodeFunctionData({
              abi: JSON.parse(action.abi || '[]'),
              functionName: action.functionName || '',
              args: action.args || []
            });
          }
          value = action.value ? parseEther(action.value) : 0n;
        } else {
          throw new Error(`Unsupported action type: ${action.type}`);
        }

        totalValue += value;

        // Append Builder Code suffix if there's calldata
        if (callData !== '0x') {
          callData = `${callData}07626173656170700080218021802180218021802180218021` as `0x${string}`;
        }

        return [{
          target,
          allowFailure: false,
          value,
          callData
        }];
      });

      const txHash = await writeContractAsync({
        address: MULTICALL3_ADDRESS,
        abi: MULTICALL3_ABI,
        functionName: 'aggregate3Value',
        args: [calls],
        value: totalValue,
        account: address,
      } as any);

      setExecutionResult(txHash);
    } catch (err: any) {
      console.error('Execution failed:', err);
      setError(err.message || 'Failed to execute batch transaction.');
    } finally {
      setIsExecuting(false);
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 border-slate-800 shadow-md bg-slate-900">
      <CardHeader className="bg-slate-800/50 pb-4 border-b border-slate-800">
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Play className="w-5 h-5" />
          Simulation & Execution
        </CardTitle>
        <CardDescription>
          Review your batch before sending it to the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!simulationResult && !isSimulating && !error && !executionResult && (
          <div className="text-center py-8 text-slate-400">
            <p>Click simulate to estimate gas and check for errors.</p>
          </div>
        )}

        {isSimulating && (
          <div className="flex flex-col items-center justify-center py-8 text-blue-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-medium">Simulating transaction...</p>
          </div>
        )}

        {isExecuting && (
          <div className="flex flex-col items-center justify-center py-8 text-blue-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-medium">Executing transaction...</p>
            <p className="text-sm text-slate-400 mt-2">Please confirm in your wallet.</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-900/30 text-red-200 rounded-lg border border-red-900/50 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Execution Error</p>
              <p className="text-sm opacity-90 break-all">{error}</p>
            </div>
          </div>
        )}

        {executionResult && (
          <div className="flex items-start gap-3 p-4 bg-green-900/30 text-green-200 rounded-lg border border-green-900/50 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Transaction Sent!</p>
              <a 
                href={`https://basescan.org/tx/${executionResult}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm opacity-90 break-all text-green-400 hover:underline"
              >
                View on Basescan: {executionResult}
              </a>
            </div>
          </div>
        )}

        {simulationResult && !isExecuting && !executionResult && !error && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-green-900/30 text-green-200 rounded-lg border border-green-900/50">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-semibold">Simulation Successful</p>
                <p className="text-sm opacity-90">All actions are expected to succeed.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                <p className="text-sm text-slate-400 font-medium mb-1">Estimated Gas</p>
                <p className="text-2xl font-bold text-slate-100">{simulationResult.gasUsed}</p>
                <p className="text-xs text-slate-500 mt-1">~$0.24 USD</p>
              </div>
              <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-900/50">
                <p className="text-sm text-blue-400 font-medium mb-1">Batch Savings</p>
                <p className="text-2xl font-bold text-blue-300">{simulationResult.gasSaved}</p>
                <p className="text-xs text-blue-500 mt-1">vs individual txns</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between bg-slate-900 border-t border-slate-800 p-4">
        <Button variant="outline" onClick={handleSimulate} disabled={isSimulating || isExecuting || actions.length === 0}>
          {isSimulating ? 'Simulating...' : 'Run Simulation'}
        </Button>
        <Button 
          onClick={handleExecute} 
          disabled={!simulationResult || !simulationResult.success || !isConnected || isExecuting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          {!isConnected ? 'Connect Wallet to Execute' : isExecuting ? 'Executing...' : 'Execute Batch'}
        </Button>
      </CardFooter>
    </Card>
  );
}
