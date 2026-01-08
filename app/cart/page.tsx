"use client";

import Link from "next/link";
import styles from "./cart.module.css";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, inc, dec, remove, total, count } = useCart();

  return (
    <div className={styles.wrap}>
      <h1>Səbət</h1>

      {count === 0 ? (
        <div className={styles.empty}>
          Səbət boşdur. <Link href="/products" className={styles.link}>Məhsullara qayıt</Link>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {items.map(i => (
              <div key={i.id} className={styles.row}>
                <div className={styles.left}>
                  <div className={styles.title}>{i.name}</div>
                  <div className={styles.muted}>{i.price.toFixed(2)} ₼ / ədəd</div>
                </div>

                <div className={styles.controls}>
                  <button className="btn btnGhost" onClick={() => dec(i.id)}>-</button>
                  <span className={styles.qty}>{i.qty}</span>
                  <button className="btn btnGhost" onClick={() => inc(i.id)}>+</button>
                </div>

                <div className={styles.sum}>
                  {(i.price * i.qty).toFixed(2)} ₼
                </div>

                <button className={styles.remove} onClick={() => remove(i.id)}>Sil</button>
              </div>
            ))}
          </div>

          <div className={styles.bottom}>
            <div className={styles.total}>
              Toplam: <b>{total.toFixed(2)} ₼</b>
            </div>
            <Link href="/payment" className={`${styles.pay} btn btnPrimary`}>
              Ödəniş et →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
