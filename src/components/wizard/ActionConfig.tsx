import React, { useState } from 'react';
import { ActionType, useBatchStore } from '@/src/store/useBatchStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Address } from 'viem';

interface ActionConfigProps {
  type: ActionType;
  onCancel: () => void;
  onSave: () => void;
}

export function ActionConfig({ type, onCancel, onSave }: ActionConfigProps) {
  const addAction = useBatchStore((state) => state.addAction);
  const [formData, setFormData] = useState<any>({});

  const handleSave = () => {
    const id = Math.random().toString(36).substring(7);
    let action: any = { id, type, title: getTitle(type) };

    if (type === 'send') {
      action = { ...action, ...formData, tokenAddress: formData.tokenAddress || 'native' };
    } else if (type === 'swap') {
      action = { ...action, ...formData, slippage: formData.slippage || '0.5' };
    } else if (type === 'mint') {
      action = { ...action, ...formData, quantity: parseInt(formData.quantity) || 1 };
    } else if (type === 'call') {
      action = { 
        ...action, 
        ...formData, 
        args: formData.args && !formData.useRawCalldata ? formData.args.split(',') : [], 
        value: formData.value || '0',
        rawCalldata: formData.useRawCalldata ? formData.rawCalldata : undefined
      };
    } else if (type === 'approve') {
      action = { ...action, ...formData };
    }

    addAction(action);
    onSave();
  };

  const getTitle = (t: ActionType) => {
    switch (t) {
      case 'send': return 'Send Token';
      case 'swap': return 'Swap Tokens';
      case 'mint': return 'Mint NFT';
      case 'call': return 'Contract Call';
      case 'approve': return 'Approve Allowance';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configure {getTitle(type)}</CardTitle>
        <CardDescription>Fill in the details for this action.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === 'send' && (
          <>
            <div className="space-y-2">
              <Label>Token Address (leave blank for native ETH)</Label>
              <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value as Address })} />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input placeholder="0.0" type="number" onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Recipient Address</Label>
              <Input placeholder="0x... or ENS" onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} />
            </div>
          </>
        )}
        {type === 'swap' && (
          <>
            <div className="space-y-2">
              <Label>Token In Address</Label>
              <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, tokenIn: e.target.value as Address })} />
            </div>
            <div className="space-y-2">
              <Label>Token Out Address</Label>
              <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, tokenOut: e.target.value as Address })} />
            </div>
            <div className="space-y-2">
              <Label>Amount In</Label>
              <Input placeholder="0.0" type="number" onChange={(e) => setFormData({ ...formData, amountIn: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slippage (%)</Label>
              <Input placeholder="0.5" type="number" step="0.1" onChange={(e) => setFormData({ ...formData, slippage: e.target.value })} />
            </div>
          </>
        )}
        {type === 'mint' && (
          <>
            <div className="space-y-2">
              <Label>Contract Address</Label>
              <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value as Address })} />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input placeholder="1" type="number" onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Recipient Address</Label>
              <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} />
            </div>
          </>
        )}
        {type === 'call' && (
          <>
            <div className="space-y-2">
              <Label>Contract Address</Label>
              <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value as Address })} />
            </div>
            <div className="flex items-center space-x-2 my-4">
              <input type="checkbox" id="raw-calldata" className="rounded border-slate-700 bg-slate-900" onChange={(e) => setFormData({ ...formData, useRawCalldata: e.target.checked })} />
              <Label htmlFor="raw-calldata">Use Raw Calldata</Label>
            </div>
            {formData.useRawCalldata ? (
              <div className="space-y-2">
                <Label>Raw Calldata (Hex)</Label>
                <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, rawCalldata: e.target.value })} />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Function Name</Label>
                  <Input placeholder="transfer" onChange={(e) => setFormData({ ...formData, functionName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Arguments (comma separated)</Label>
                  <Input placeholder="0x..., 100" onChange={(e) => setFormData({ ...formData, args: e.target.value })} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Value (ETH)</Label>
              <Input placeholder="0.0" type="number" onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
            </div>
          </>
        )}
        {type === 'approve' && (
          <>
            <div className="space-y-2">
              <Label>Token Address</Label>
              <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value as Address })} />
            </div>
            <div className="space-y-2">
              <Label>Spender Address</Label>
              <Input placeholder="0x..." onChange={(e) => setFormData({ ...formData, spender: e.target.value as Address })} />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input placeholder="0.0" type="number" onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Add to Batch</Button>
      </CardFooter>
    </Card>
  );
}
