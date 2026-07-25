import Dexie, { type EntityTable } from 'dexie';

export interface Shop {
  id?: number;
  name: string;
  ownerName?: string;
  whatsapp?: string;
  photoUrl?: string;
  lat?: number;
  lng?: number;
  creditLimit: number;
  outstandingDebt: number;
}

export interface Product {
  sku: string;
  name: string;
  type: 'simple' | 'variable';
  defaultPrice: number;
  referencePrice: number;
  floorPrice: number;
}

export interface NegotiatedPrice {
  shopId_sku: string;
  shopId: number;
  sku: string;
  price: number;
}

export interface Order {
  id?: number;
  shopId: number;
  totalValue: number;
  cashPaid: number;
  bankTransfer: number;
  debtAdded: number;
  summaryNote: string;
  timestamp: Date;
  synced: boolean;
}

export interface OrderItem {
  id?: number;
  orderId: number;
  sku: string;
  quantity: number;
  unitType: 'carton' | 'piece';
  unitPrice: number;
}

export interface Inventory {
  sku: string;
  stockQuantity: number;
}

export interface Note {
  id?: number;
  shopId?: number;
  orderId?: number;
  content: string;
  timestamp: Date;
  synced: boolean;
}

const db = new Dexie('NexusDatabase') as Dexie & {
  shops: EntityTable<Shop, 'id'>;
  products: EntityTable<Product, 'sku'>;
  negotiatedPrices: EntityTable<NegotiatedPrice, 'shopId_sku'>;
  orders: EntityTable<Order, 'id'>;
  orderItems: EntityTable<OrderItem, 'id'>;
  inventory: EntityTable<Inventory, 'sku'>;
  notes: EntityTable<Note, 'id'>;
};

// Schema declaration
db.version(2).stores({
  shops: '++id, name, outstandingDebt',
  products: 'sku, type', // sku is primary key
  negotiatedPrices: 'shopId_sku, shopId, sku', // shopId_sku is primary key for simple upserts
  orders: '++id, shopId, timestamp, synced',
  orderItems: '++id, orderId, sku',
  inventory: 'sku',
  notes: '++id, shopId, orderId, timestamp, synced'
});

export { db };
