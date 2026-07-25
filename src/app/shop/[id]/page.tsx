"use client"
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Order } from "@/lib/db";
import { ArrowLeft, ShoppingCart, Banknote, History, Store, Mic, Send, MessageCircle } from "lucide-react";
import { ActionCard } from "@/components/ui/ActionCard";
import Link from "next/link";

export default function ShopProfileView() {
  const params = useParams();
  const router = useRouter();
  const shopId = parseInt(params.id as string);

  const shop = useLiveQuery(() => db.shops.get(shopId), [shopId]);
  const orders = useLiveQuery(() => db.orders.where('shopId').equals(shopId).reverse().sortBy('timestamp'), [shopId]);

  const [aiNote, setAiNote] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const processAi = async () => {
    if (!aiNote.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: aiNote })
      });
      const data = await res.json();
      sessionStorage.setItem(`ai_draft_${shopId}`, JSON.stringify(data));
      router.push(`/shop/${shopId}/order`);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const shareOnWhatsApp = (order: Order) => {
    const text = `*Invoice #${order.id}*\nShop: ${shop?.name}\nTotal: SAR ${order.totalValue}\nPaid (Cash): SAR ${order.cashPaid}\nPaid (Bank): SAR ${order.bankTransfer}\nNew Debt: SAR ${order.debtAdded}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  if (!shop) return <div className="p-8 text-center text-gray-500">Loading shop data...</div>;

  return (
    <div className="min-h-screen bg-primary">
      <div className="p-4 flex items-center gap-4 bg-card border-b border-gray-800 sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-2 active:scale-95 bg-primary rounded-full border border-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold flex-1 truncate">{shop.name}</h1>
      </div>

      <div className="p-4">
        {/* Ledger Profile Card */}
        <div className="bg-card rounded-2xl p-6 mb-6 border border-gray-800 shadow-xl flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary border border-gray-700 flex items-center justify-center shrink-0">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <div className="text-gray-400 text-sm font-medium">Outstanding Debt (Khata)</div>
            <div className={`text-4xl font-extrabold mt-1 tracking-tight ${shop.outstandingDebt > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
              SAR {shop.outstandingDebt.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-2 font-medium">Credit Limit: SAR {shop.creditLimit.toFixed(2)}</div>
          </div>
        </div>

        {/* Quick AI Order */}
        <div className="bg-card border border-gray-800 rounded-2xl p-5 mb-6 shadow-md">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Mic className="w-5 h-5 text-accent-green" /> Quick AI Order
          </h2>
          <textarea 
            className="w-full bg-primary border border-gray-700 rounded-xl p-4 text-white focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green mb-3 resize-none"
            rows={3}
            placeholder="Tap mic on keyboard or type: 'Sold 5 cartons of Premium Coffee at 140 SAR, received 500 cash...'"
            value={aiNote}
            onChange={(e) => setAiNote(e.target.value)}
          />
          <button 
            onClick={processAi}
            disabled={aiLoading || !aiNote.trim()}
            className="w-full bg-accent-green text-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-transform"
          >
            {aiLoading ? <span className="animate-pulse">Parsing AI...</span> : <><Send className="w-5 h-5" /> Process with AI</>}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href={`/shop/${shop.id}/order`} className="bg-primary border border-gray-700 text-foreground p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
            <ShoppingCart className="w-6 h-6 text-gray-400" />
            <span className="text-sm">Manual Order</span>
          </Link>
          <button className="bg-primary border border-gray-700 text-foreground p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
            <Banknote className="w-6 h-6 text-gray-400" />
            <span className="text-sm">Collect Debt</span>
          </button>
        </div>

        {/* Khata Timeline */}
        <h2 className="text-xl font-bold mb-4 text-gray-300 flex items-center gap-2">
          <History className="w-6 h-6 text-gray-500" /> Khata Timeline
        </h2>
        <div>
          {orders?.map(order => (
            <ActionCard
              key={order.id}
              title={`Invoice #${order.id}`}
              subtitle={new Date(order.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short'})}
              rightElement={
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-accent-green text-lg">SAR {order.totalValue.toFixed(2)}</div>
                    {order.debtAdded > 0 && <div className="text-sm font-medium text-accent-red">+ SAR {order.debtAdded.toFixed(2)}</div>}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); shareOnWhatsApp(order); }} 
                    className="p-3 bg-green-900/30 text-accent-green rounded-full active:scale-95 border border-accent-green/30"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              }
            />
          ))}
          {(!orders || orders.length === 0) && (
            <div className="text-center py-10 bg-card rounded-xl border border-gray-800 border-dashed">
              <p className="text-gray-500 font-medium">No previous orders found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
