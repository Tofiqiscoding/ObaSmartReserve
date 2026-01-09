"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string; // ✅ əlavə olundu
};

export type CartItem = Product & {
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  add: (p: Product) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "sr_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // ✅ hydrate-safe
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, mounted]);

  const count = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((a, i) => a + i.price * i.qty, 0), [items]);

  const add = (p: Product) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const inc = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  };

  const dec = (id: string) => {
    setItems((prev) => {
      const next = prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
      return next;
    });
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clear = () => setItems([]);

  const value: CartContextType = {
    items,
    count,
    total,
    add,
    inc,
    dec,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
