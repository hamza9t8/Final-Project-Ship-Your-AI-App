"use client"
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ActionCard } from "@/components/ui/ActionCard";
import { Store, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardView() {
  const router = useRouter();
  
  // Reactive Offline State bound directly to Dexie.js
  const shops = useLiveQuery(() => db.shops.toArray());
  const inventory = useLiveQuery(() => db.inventory.toArray());

  const totalStock = inventory?.reduce((acc, item) => acc + item.stockQuantity, 0) || 0;

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold mb-6 tracking-tight">Morning, Salesman</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Van Summary</h2>
        <div className="bg-card border border-gray-800 rounded-xl p-5 flex items-center gap-5 shadow-lg">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Truck className="text-accent-green w-7 h-7" />
          </div>
          <div>
            <div className="text-sm text-gray-400 font-medium">Total Items in Van</div>
            <div className="text-3xl font-extrabold text-foreground">{totalStock} Units</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Today's Route</h2>
        {shops?.map(shop => (
          <ActionCard 
            key={shop.id}
            title={shop.name}
            subtitle={`Debt: SAR ${shop.outstandingDebt.toFixed(2)}`}
            icon={<Store className="w-7 h-7" />}
            onClick={() => router.push(`/shop/${shop.id}`)}
            highlight={shop.outstandingDebt > (shop.creditLimit * 0.8)} // Highlight if close to credit limit
          />
        ))}
        
        {/* Helper state for testing before DB is populated */}
        {(!shops || shops.length === 0) && (
          <div className="bg-card border border-dashed border-gray-700 rounded-xl p-8 text-center mt-4">
            <p className="text-gray-400">No shops assigned yet.</p>
            <button 
              onClick={() => db.shops.add({ name: "Al-Madina Shoes", creditLimit: 5000, outstandingDebt: 1200 })}
              className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm font-semibold active:scale-95"
            >
              + Mock a Shop
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
