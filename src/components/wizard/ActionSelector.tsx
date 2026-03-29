import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowRightLeft, Send, Image as ImageIcon, Code, ShieldCheck } from 'lucide-react';
import { ActionType } from '@/src/store/useBatchStore';

interface ActionSelectorProps {
  onSelect: (type: ActionType) => void;
}

const actions = [
  {
    type: 'send' as ActionType,
    title: 'Send Token',
    description: 'Transfer ERC-20 or native ETH',
    icon: Send,
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
  },
  {
    type: 'swap' as ActionType,
    title: 'Swap Tokens',
    description: 'Exchange tokens via aggregator',
    icon: ArrowRightLeft,
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
  },
  {
    type: 'mint' as ActionType,
    title: 'Mint NFT',
    description: 'Mint ERC-721 or ERC-1155',
    icon: ImageIcon,
    color: 'text-pink-400',
    bg: 'bg-pink-900/30',
  },
  {
    type: 'call' as ActionType,
    title: 'Contract Call',
    description: 'Advanced raw contract interaction',
    icon: Code,
    color: 'text-slate-400',
    bg: 'bg-slate-800',
  },
  {
    type: 'approve' as ActionType,
    title: 'Approve Allowance',
    description: 'Approve ERC-20 spending',
    icon: ShieldCheck,
    color: 'text-green-400',
    bg: 'bg-green-900/30',
  },
];

export function ActionSelector({ onSelect }: ActionSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Card 
          key={action.type} 
          className="cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => onSelect(action.type)}
        >
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className={`p-2 rounded-lg ${action.bg} ${action.color} mr-4`}>
              <action.icon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
