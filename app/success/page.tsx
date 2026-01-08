"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import styles from "./success.module.css";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const { total, count, clear } = useCart();
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("orderId") || `SR-${Date.now()}`;

  const [branch, setBranch] = useState("Yasamal filialı");
  const [slot, setSlot] = useState("4 saat sonra");
  const [qr, setQr] = useState<string>("");

  const payload = useMemo(() => {
    return JSON.stringify({
      orderId,
      branch,
      slot,
      total: Number(total.toFixed(2)),
      count,
      action: "OPEN_BOX",
    });
  }, [orderId, branch, slot, total, count]);

  useEffect(() => {
    QRCode.toDataURL(payload, { width: 240, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [payload]);

  function finishDemo() {
    clear(); // səbəti sıfırla
    router.push("/products");
  }

  return (
    <div className={styles.wrap}>
      <h1>Ödəniş tamamlandı ✅</h1>
      <p className={styles.sub}>
        İndi marketə gəl, box üzərindəki QR-u oxut və sifarişi götür.
      </p>

      <div className={styles.grid}>
        {/* Sol panel */}
        <div className={styles.panel}>
          <h3>Pickup seçimi</h3>

          <label className={styles.panelLabel}>Filial</label>
          <select
            className={styles.panelSelect}
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option>Yasamal filialı</option>
            <option>Nərimanov filialı</option>
            <option>Xətai filialı</option>
          </select>

          <label className={styles.panelLabel}>Götürmə vaxtı</label>
          <select
            className={styles.panelSelect}
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          >
            <option>2 saat sonra</option>
            <option>4 saat sonra</option>
            <option>Bu gün 19:00</option>
          </select>

          <div className={styles.meta}>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Order:</span> <b>{orderId}</b>
            </div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Məhsul sayı:</span> <b>{count}</b>
            </div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Toplam:</span>{" "}
              <b>{total.toFixed(2)} ₼</b>
            </div>
          </div>

          <button className="btn btnGhost" onClick={finishDemo}>
            Demo bitdi (Səbəti sıfırla)
          </button>
        </div>

        {/* Sağ panel */}
        <div className={styles.panel}>
          <h3>QR kod</h3>

          <div className={styles.qrBox}>
            {qr ? (
              <img className={styles.qrImg} src={qr} alt="QR" />
            ) : (
              "QR hazırlanır..."
            )}
          </div>

          <div className={styles.note}>
            Video üçün: “Burda QR çıxır — müştəri box-da oxudur və götürür.”
          </div>
        </div>
      </div>
    </div>
  );
}
