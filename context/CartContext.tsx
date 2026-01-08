"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Product = { id: string; name: string; price: number };
type CartItem = Product & { qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartCtx | null>(null);
const KEY = "sr_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (p: Product) => {
    setItems(prev => {
      const f = prev.find(x => x.id === p.id);
      if (f) return prev.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const inc = (id: string) =>
    setItems(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x));

  const dec = (id: string) =>
    setItems(prev => prev
      .map(x => x.id === id ? { ...x, qty: x.qty - 1 } : x)
      .filter(x => x.qty > 0)
    );

  const remove = (id: string) => setItems(prev => prev.filter(x => x.id !== id));
  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, add, inc, dec, remove, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
