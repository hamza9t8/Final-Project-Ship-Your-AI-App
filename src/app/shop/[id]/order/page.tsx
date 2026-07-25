"use client"
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ArrowLeft, X, AlertTriangle, Camera } from "lucide-react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { StickyBottomBar } from "@/components/ui/StickyBottomBar";

export default function SmartCartView() {
  const params = useParams();
  const router = useRouter();
  const shopId = parseInt(params.id as string);

  const shop = useLiveQuery(() => db.shops.get(shopId), [shopId]);
  const products = useLiveQuery(() => db.products.toArray());
  const negotiatedPrices = useLiveQuery(() => db.negotiatedPrices.where('shopId').equals(shopId).toArray(), [shopId]);

  const [cart, setCart] = useState<Record<string, { qty: number, price: number }>>({});
  const [showSettlement, setShowSettlement] = useState(false);
  const [cashPaid, setCashPaid] = useState("");
  const [bankTransfer, setBankTransfer] = useState("");
  const [hasDraftLoaded, setHasDraftLoaded] = useState(false);

  // Apply AI Draft Pre-fill
  useEffect(() => {
    const draftStr = sessionStorage.getItem(`ai_draft_${shopId}`);
    if (draftStr && products && !hasDraftLoaded) {
      try {
        const draft = JSON.parse(draftStr);
        const newCart: Record<string, { qty: number, price: number }> = {};
        
        draft.items?.forEach((item: any) => {
          const product = products.find(p => p.name.toLowerCase().includes(item.sku_name.toLowerCase()));
          const sku = product?.sku || item.sku_name; 
          newCart[sku] = { qty: item.quantity, price: item.agreed_unit_price };
        });

        setCart(newCart);

        if (draft.payment) {
          if (draft.payment.cash_paid) setCashPaid(draft.payment.cash_paid.toString());
          if (draft.payment.bank_transfer) setBankTransfer(draft.payment.bank_transfer.toString());
        }
        
        setHasDraftLoaded(true);
        sessionStorage.removeItem(`ai_draft_${shopId}`);
      } catch (err) {
        console.error("Failed to load AI draft", err);
      }
    }
  }, [shopId, products, hasDraftLoaded]);

  // Ensure there is at least one product for testing
  useEffect(() => {
    db.products.count().then(c => {
      if (c === 0) {
        db.products.add({ sku: "TEST-01", name: "Premium Coffee Beans", type: "simple", defaultPrice: 150, floorPrice: 120, referencePrice: 160 });
        db.products.add({ sku: "TEST-02", name: "Disposable Cups (100x)", type: "simple", defaultPrice: 20, floorPrice: 15, referencePrice: 25 });
        db.inventory.add({ sku: "TEST-01", stockQuantity: 100 });
        db.inventory.add({ sku: "TEST-02", stockQuantity: 500 });
      }
    });
  }, []);

  const updateCart = (sku: string, qty: number, price: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (qty === 0) {
        delete next[sku];
      } else {
        next[sku] = { qty, price };
      }
      return next;
    });
  };

  const totalValue = Object.values(cart).reduce((acc, item) => acc + (item.qty * item.price), 0);
  const cashNum = parseFloat(cashPaid) || 0;
  const bankNum = parseFloat(bankTransfer) || 0;
  const debtAdded = Math.max(0, totalValue - cashNum - bankNum);

  const handleCheckout = async () => {
    if (!shop) return;
    
    // 1. Create order
    await db.orders.add({
      shopId,
      totalValue,
      cashPaid: cashNum,
      bankTransfer: bankNum,
      debtAdded,
      summaryNote: "Order saved",
      timestamp: new Date(),
      synced: false
    });

    // 2. Update Khata
    await db.shops.update(shopId, {
      outstandingDebt: shop.outstandingDebt + debtAdded
    });

    // 3. Update 1-to-1 Pricing Memory & Deduct Van Inventory
    for (const sku in cart) {
      const item = cart[sku];
      
      await db.negotiatedPrices.put({
        shopId_sku: `${shopId}_${sku}`,
        shopId,
        sku,
        price: item.price
      });

      const inv = await db.inventory.get(sku);
      if (inv) {
        await db.inventory.update(sku, { stockQuantity: Math.max(0, inv.stockQuantity - item.qty) });
      }
    }

    router.replace(`/shop/${shopId}`);
  };

  if (!shop || !products || !negotiatedPrices) return <div className="p-8 text-center text-gray-500">Loading catalog...</div>;

  return (
    <div className="min-h-screen bg-primary pb-28">
      <div className="p-4 flex items-center gap-4 bg-card border-b border-gray-800 sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-2 active:scale-95 bg-primary rounded-full border border-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold truncate">{shop.name}</h1>
          <div className="text-sm font-semibold text-gray-400">Avail. Credit: SAR {(shop.creditLimit - shop.outstandingDebt).toFixed(2)}</div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {products.map(product => {
          const cartItem = cart[product.sku];
          const qty = cartItem?.qty || 0;
          
          const negotiated = negotiatedPrices.find(p => p.sku === product.sku);
          const currentPrice = cartItem?.price || negotiated?.price || product.defaultPrice;

          return (
            <div key={product.sku} className="bg-card p-5 rounded-2xl border border-gray-800 shadow-md">
              <div className="flex justify-between items-start mb-5">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-xs font-semibold px-2 py-1 bg-gray-800 text-gray-300 rounded inline-block">
                      Floor: SAR {product.floorPrice}
                    </div>
                    {negotiated && (
                      <div className="text-xs font-bold px-2 py-1 bg-accent-green/20 text-accent-green rounded inline-block">
                        Last Sold: SAR {negotiated.price}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end shrink-0">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Unit Price</div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2 font-bold">SAR</span>
                    <input 
                      type="number"
                      value={currentPrice}
                      onChange={(e) => updateCart(product.sku, qty, parseFloat(e.target.value) || 0)}
                      className={`w-24 bg-primary border ${currentPrice < product.floorPrice ? 'border-accent-red focus:border-accent-red' : 'border-gray-700 focus:border-accent-green'} rounded-lg p-3 text-right font-bold text-lg focus:outline-none`}
                    />
                  </div>
                  {currentPrice < product.floorPrice && (
                    <div className="text-xs text-accent-red mt-1 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Below Floor
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-primary p-2 rounded-xl border border-gray-800">
                <span className="text-gray-400 font-medium ml-2">Qty (Carton)</span>
                <QuantityStepper 
                  value={qty}
                  onChange={(newQty) => updateCart(product.sku, newQty, currentPrice)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!showSettlement && (
        <StickyBottomBar
          leftContent={
            <div>
              <div className="text-sm text-gray-400 font-medium">Order Total</div>
              <div className="text-3xl font-extrabold text-accent-green">SAR {totalValue.toFixed(2)}</div>
            </div>
          }
          mainActionText="Checkout"
          onMainAction={() => setShowSettlement(true)}
          disabled={totalValue === 0}
        />
      )}

      {showSettlement && (
        <div className="fixed inset-0 z-50 bg-primary flex flex-col w-full max-w-md mx-auto border-x border-card animate-in slide-in-from-bottom-4">
          <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-card">
            <h2 className="text-2xl font-bold">Settlement</h2>
            <button onClick={() => setShowSettlement(false)} className="p-3 bg-primary rounded-full border border-gray-800 active:scale-95"><X className="w-6 h-6" /></button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="bg-card rounded-2xl p-6 mb-8 text-center border border-accent-green/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
              <div className="text-gray-400 mb-2 font-medium">Total Bill</div>
              <div className="text-5xl font-extrabold text-accent-green">SAR {totalValue.toFixed(2)}</div>
            </div>

            <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Cash Received</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">SAR</span>
                  <input 
                    type="number"
                    value={cashPaid}
                    onChange={(e) => setCashPaid(e.target.value)}
                    className="w-full bg-card border border-gray-700 rounded-2xl py-5 pl-16 pr-5 text-2xl font-bold focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/50"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Bank Transfer (STC Pay / Mada)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">SAR</span>
                  <input 
                    type="number"
                    value={bankTransfer}
                    onChange={(e) => setBankTransfer(e.target.value)}
                    className="w-full bg-card border border-gray-700 rounded-2xl py-5 pl-16 pr-14 text-2xl font-bold focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/50"
                    placeholder="0.00"
                  />
                  {bankNum > 0 && (
                    <label className="absolute right-4 text-accent-green bg-green-900/30 p-2 rounded-full cursor-pointer active:scale-95 transition-transform flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                      <input type="file" accept="image/*" capture="environment" className="hidden" />
                    </label>
                  )}
                </div>
                {bankNum > 0 && <p className="text-xs text-accent-green mt-2 font-semibold flex items-center gap-1"><Camera className="w-3 h-3"/> Tap camera icon to attach receipt</p>}
              </div>
            </div>

            <div className={`border-2 rounded-2xl p-5 flex justify-between items-center transition-colors ${debtAdded > 0 ? 'bg-red-950/20 border-accent-red' : 'bg-green-950/20 border-accent-green'}`}>
              <span className={`font-bold text-lg ${debtAdded > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                {debtAdded > 0 ? 'New Debt (Udhaar)' : 'Fully Paid'}
              </span>
              <span className={`text-3xl font-extrabold ${debtAdded > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                SAR {debtAdded.toFixed(2)}
              </span>
            </div>
            
            {shop.outstandingDebt + debtAdded > shop.creditLimit && (
               <div className="text-accent-red text-sm mt-4 font-bold flex items-center gap-2 bg-red-950/50 p-3 rounded-lg border border-red-900">
                 <AlertTriangle className="w-5 h-5 shrink-0" /> 
                 Warning: Order exceeds shop credit limit (SAR {shop.creditLimit}).
               </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-800 bg-card">
            <button 
              onClick={handleCheckout}
              className="w-full py-5 bg-accent-green text-primary font-extrabold text-2xl rounded-2xl active:scale-95 transition-transform"
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
