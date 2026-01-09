"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import styles from "./success.module.css";
import { useCart } from "@/context/CartContext";
import { branches } from "../libs/branches";

type HandoverMode = "box" | "seller_scan";

function usedKey(branchId: string, slot: string) {
  // slot da daxil olsun ki, fərqli vaxtlarda fərqli rezerv kimi davransın
  const safeSlot = slot.replaceAll(" ", "_").replaceAll(":", "_");
  return `sr_used_boxes_${branchId}_${safeSlot}`;
}

function getUsed(branchId: string, slot: string) {
  try {
    const raw = localStorage.getItem(usedKey(branchId, slot));
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function setUsed(branchId: string, slot: string, val: number) {
  try {
    localStorage.setItem(usedKey(branchId, slot), String(val));
  } catch {}
}

export default function SuccessPage() {
  const { total, count, clear } = useCart();
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("orderId") || `SR-${Date.now()}`;

  const [branchId, setBranchId] = useState(branches[0].id);
  const [slot, setSlot] = useState("4 saat sonra");

  const [handover, setHandover] = useState<HandoverMode>("box");
  const [reservedBoxNumber, setReservedBoxNumber] = useState<number | null>(null);
  const [qr, setQr] = useState<string>("");

  // eyni session-da təkrar rezerv etməsin deyə
  const reservedRef = useRef<string | null>(null);

  const branch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? branches[0],
    [branchId]
  );

  const availability = useMemo(() => {
    // localStorage əsasında used count çıxır
    const used = typeof window !== "undefined" ? getUsed(branchId, slot) : 0;
    const available = Math.max(0, branch.boxCapacity - used);
    return { used, available, capacity: branch.boxCapacity };
  }, [branchId, slot, branch.boxCapacity]);

  // Box rezerv etmə cəhdi (Success açılan kimi / branch-slot dəyişəndə)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reserveKey = `${branchId}__${slot}`;

    // Əgər artıq bu branch-slot üçün rezerv edib, yenidən etmə
    if (reservedRef.current === reserveKey) return;

    // Əvvəlki rezervi dəyişirsə, köhnəni geri qaytarmırıq (demo sadə saxlanılır)
    // İstəsən “slot dəyişəndə köhnəni release et” də edərik.

    const used = getUsed(branchId, slot);
    const available = Math.max(0, branch.boxCapacity - used);

    if (available > 0) {
      // rezerv et
      setUsed(branchId, slot, used + 1);
      setHandover("box");
      setReservedBoxNumber(used + 1); // demo üçün "used+1" box nömrəsi kimi
    } else {
      setHandover("seller_scan");
      setReservedBoxNumber(null);
    }

    reservedRef.current = reserveKey;
  }, [branchId, slot, branch.boxCapacity]);

  // QR payload
  const payload = useMemo(() => {
    return JSON.stringify({
      orderId,
      branch: branch.name,
      slot,
      total: Number(total.toFixed(2)),
      count,
      handover, // "box" və ya "seller_scan"
      boxNumber: reservedBoxNumber, // varsa, box nömrəsi
      action: handover === "box" ? "OPEN_BOX" : "SELLER_SCAN",
    });
  }, [orderId, branch.name, slot, total, count, handover, reservedBoxNumber]);

  useEffect(() => {
    QRCode.toDataURL(payload, { width: 240, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [payload]);

  function finishDemo() {
    // demo bitəndə cart təmizlə
    clear();
    router.push("/products");
  }

  return (
    <div className={styles.wrap}>
      <h1>Ödəniş tamamlandı ✅</h1>
      <p className={styles.sub}>
        İndi marketə gəl, QR-u oxut və sifarişi götür.
      </p>

      {/* ⚠️ Box yoxdur banner */}
      {handover === "seller_scan" && (
        <div className={styles.alert}>
          <div className={styles.alertTitle}>Box yoxdur</div>
          <div className={styles.alertText}>
            Sizin sifarişi satıcı telefon vasitəsilə QR oxutduqdan sonra sizə təhvil verəcək.
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {/* Sol panel */}
        <div className={styles.panel}>
          <h3>Pickup seçimi</h3>

          <label className={styles.panelLabel}>Filial</label>
          <select
            className={styles.panelSelect}
            value={branchId}
            onChange={(e) => {
              reservedRef.current = null; // branch dəyişəndə yenidən rezerv etsin
              setBranchId(e.target.value);
            }}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <label className={styles.panelLabel}>Götürmə vaxtı</label>
          <select
            className={styles.panelSelect}
            value={slot}
            onChange={(e) => {
              reservedRef.current = null; // slot dəyişəndə yenidən rezerv etsin
              setSlot(e.target.value);
            }}
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
              <span className={styles.metaKey}>Toplam:</span> <b>{total.toFixed(2)} ₼</b>
            </div>

            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Box statusu:</span>{" "}
              <b>
                {handover === "box"
                  ? `Rezerv edildi (Box #${reservedBoxNumber})`
                  : "Mövcud deyil"}
              </b>
            </div>

            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Box limiti:</span>{" "}
              <b>
                {availability.used}/{availability.capacity} istifadə olunur
              </b>
            </div>
          </div>

          
        </div>

        {/* Sağ panel */}
        <div className={styles.panel}>
          <h3>QR kod</h3>

          <div className={styles.qrBox}>
            {qr ? <img className={styles.qrImg} src={qr} alt="QR" /> : "QR hazırlanır..."}
          </div>

          
        </div>
      </div>
    </div>
  );
}
