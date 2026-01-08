"use client";

import { useMemo, useState } from "react";
import styles from "./products.module.css";
import { products } from "@/app/libs/marketData";
import { useCart } from "@/context/CartContext";

export default function ProductsPage() {
  const { items, add, inc, dec } = useCart();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(p => p.name.toLowerCase().includes(s));
  }, [q]);

  const qty = (id: string) => items.find(i => i.id === id)?.qty ?? 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <h1>Məhsullar</h1>
        <input
          className={styles.search}
          placeholder="Axtar... (məs: alma)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className={styles.grid}>
        {list.map(p => {
          const n = qty(p.id);
          return (
            <div key={p.id} className={styles.card}>
              <div className={styles.img} />
              <div className={styles.name}>{p.name}</div>
              <div className={styles.price}>{p.price.toFixed(2)} ₼</div>

              {n === 0 ? (
                <button className="btn btnPrimary" onClick={() => add(p)}>
                  🛒 Al
                </button>
              ) : (
                <div className={styles.qtyRow}>
                  <button className="btn btnGhost" onClick={() => dec(p.id)}>-</button>
                  <span className={styles.qty}>{n}</span>
                  <button className="btn btnGhost" onClick={() => inc(p.id)}>+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
