import { create } from 'zustand';
import { Address, Hex } from 'viem';

export type ActionType = 'send' | 'swap' | 'mint' | 'call' | 'approve' | 'gm';

export interface BaseAction {
  id: string;
  type: ActionType;
  title: string;
}

export interface SendAction extends BaseAction {
  type: 'send';
  tokenAddress: Address | 'native';
  amount: string;
  recipient: Address | string;
  memo?: string;
}

export interface SwapAction extends BaseAction {
  type: 'swap';
  tokenIn: Address | 'native';
  tokenOut: Address | 'native';
  amountIn: string;
  slippage: string;
}

export interface MintAction extends BaseAction {
  type: 'mint';
  contractAddress: Address | string;
  quantity: number;
  recipient: Address | string;
}

export interface CallAction extends BaseAction {
  type: 'call';
  contractAddress: Address | string;
  abi: string;
  functionName: string;
  args: string[];
  value: string;
  rawCalldata?: Hex;
}

export interface ApproveAction extends BaseAction {
  type: 'approve';
  tokenAddress: Address | string;
  spender: Address | string;
  amount: string;
}

export interface GMAction extends BaseAction {
  type: 'gm';
  recipients: string[];
  message: string;
}

export type BatchAction = SendAction | SwapAction | MintAction | CallAction | ApproveAction | GMAction;

interface BatchState {
  actions: BatchAction[];
  addAction: (action: BatchAction) => void;
  removeAction: (id: string) => void;
  updateAction: (id: string, updatedAction: Partial<BatchAction>) => void;
  reorderActions: (startIndex: number, endIndex: number) => void;
  clearActions: () => void;
}

export const useBatchStore = create<BatchState>((set) => ({
  actions: [],
  addAction: (action) => set((state) => ({ actions: [...state.actions, action] })),
  removeAction: (id) => set((state) => ({ actions: state.actions.filter((a) => a.id !== id) })),
  updateAction: (id, updatedAction) =>
    set((state) => ({
      actions: state.actions.map((a) => (a.id === id ? { ...a, ...updatedAction } as BatchAction : a)),
    })),
  reorderActions: (startIndex, endIndex) =>
    set((state) => {
      const newActions = Array.from(state.actions);
      const [removed] = newActions.splice(startIndex, 1);
      newActions.splice(endIndex, 0, removed);
      return { actions: newActions };
    }),
  clearActions: () => set({ actions: [] }),
}));
