"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { count, total } = useCart();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/products">
          <span className={styles.logo}>OBA</span>
          <span className={styles.sub}>SmartReserve Demo</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/products" className={styles.link}>Məhsullar</Link>
          <Link href="/cart" className={styles.cart}>
            Səbət <span className={styles.badge}>{count}</span>
            <span className={styles.total}>{total.toFixed(2)} ₼</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
