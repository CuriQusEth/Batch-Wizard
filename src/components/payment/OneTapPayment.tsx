import React, { useState } from 'react';
import { Button } from '../ui/button';
import { pay } from '@base-org/account';
import { Loader2, Zap } from 'lucide-react';

export function OneTapPayment() {
  const [isPaying, setIsPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePayment = async () => {
    setIsPaying(true);
    setPaymentResult(null);
    try {
      const payment = await pay({
        amount: "5.00", // $5.00 USDC
        to: "0x0000000000000000000000000000000000000000", // Replace with actual treasury address
        testnet: true, // Use Base Sepolia for testing
        dataSuffix: "0x07626173656170700080218021802180218021802180218021"
      });
      setPaymentResult({ success: true, id: payment.id });
    } catch (error: any) {
      console.error('Payment failed:', error);
      setPaymentResult({ success: false, error: error.message });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePayment} 
        disabled={isPaying}
        className="gap-2 border-blue-900/50 text-blue-400 hover:bg-blue-900/30"
      >
        {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-blue-400" />}
        {isPaying ? 'Processing...' : 'Upgrade to Pro ($5)'}
      </Button>
      {paymentResult?.success && (
        <span className="text-xs text-green-400 font-medium">Payment successful!</span>
      )}
      {paymentResult?.success === false && (
        <span className="text-xs text-red-400 font-medium">Payment failed</span>
      )}
    </div>
  );
}
