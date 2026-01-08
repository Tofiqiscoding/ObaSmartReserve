"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./payment.module.css";
import { useCart } from "@/context/CartContext";

export default function PaymentPage() {
  const { total, count } = useCart();
  const router = useRouter();

  const [name, setName] = useState("Kamran");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => count === 0 || loading, [count, loading]);

  async function payDemo() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const orderId = `SR-${Date.now()}`;
    router.push(`/success?orderId=${encodeURIComponent(orderId)}`);
  }

  return (
    <div className={styles.wrap}>
      <h1>Ödəniş (Demo)</h1>

      <div className={styles.card}>
        <div className={styles.row}>
          <label>Ad Soyad</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className={styles.row}>
          <label>Kart nömrəsi</label>
          <input value={card} onChange={(e) => setCard(e.target.value)} />
          <div className={styles.hint}>Demo: istənilən yaz, sadəcə “Ödəniş et” bas.</div>
        </div>

        <div className={styles.summary}>
          <span>Məhsul sayı:</span> <b>{count}</b>
          <span>Toplam:</span> <b>{total.toFixed(2)} ₼</b>
        </div>

        <button className={`btn btnPrimary ${styles.payBtn}`} onClick={payDemo} disabled={disabled}>
          {loading ? "Ödəniş edilir..." : "Ödəniş et"}
        </button>
      </div>
    </div>
  );
}
