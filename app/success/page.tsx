"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import styles from "./success.module.css";
import { useCart } from "@/context/CartContext";
import { branches } from "../libs/branches";

type HandoverMode = "box" | "seller_scan";

function usedKey(branchId: string, slot: string) {
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

type Step = { title: string; hint: string };

export default function SuccessPage() {
  const { total, count, clear } = useCart();
  const params = useSearchParams();
  const router = useRouter();

  // ✅ hydration safe: əvvəlcə mount gözlə
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ✅ orderId: render zamanı Date.now() istifadə etmirik
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    const fromUrl = params.get("orderId");
    if (fromUrl) setOrderId(fromUrl);
    else setOrderId(`SR-${Date.now()}`); // yalnız client-də
  }, [params]);

  const [branchId, setBranchId] = useState(branches[0].id);
  const [slot, setSlot] = useState("4 saat sonra");

  const [handover, setHandover] = useState<HandoverMode>("box");
  const [reservedBoxNumber, setReservedBoxNumber] = useState<number | null>(null);
  const [qr, setQr] = useState<string>("");

  // timeline
  const [activeStep, setActiveStep] = useState(0);
  const [times, setTimes] = useState<string[]>([]);

  const reservedRef = useRef<string | null>(null);

  const branch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? branches[0],
    [branchId]
  );

  // Box rezerv etmə (yalnız mount olandan sonra)
  useEffect(() => {
    if (!mounted) return;

    const reserveKey = `${branchId}__${slot}`;
    if (reservedRef.current === reserveKey) return;

    const used = getUsed(branchId, slot);
    const available = Math.max(0, branch.boxCapacity - used);

    if (available > 0) {
      setUsed(branchId, slot, used + 1);
      setHandover("box");
      setReservedBoxNumber(used + 1);
    } else {
      setHandover("seller_scan");
      setReservedBoxNumber(null);
    }

    reservedRef.current = reserveKey;
  }, [mounted, branchId, slot, branch.boxCapacity]);

  const steps: Step[] = useMemo(() => {
    const base: Step[] = [
      { title: "Ödəniş təsdiqləndi", hint: "Sifariş sistemdə yaradıldı" },
      { title: "Sifariş marketə göndərildi", hint: "Filiala bildiriş getdi" },
      { title: "Məhsullar yığılır", hint: "Satıcı məhsulları seçir" },
      { title: "Paketləndi", hint: "Məhsullar hazırlandı" },
    ];

    if (handover === "box") {
      return [
        ...base,
        {
          title: `Box-a yerləşdirildi${reservedBoxNumber ? ` (Box #${reservedBoxNumber})` : ""}`,
          hint: "QR ilə box açılacaq",
        },
        { title: "Pickup üçün hazırdır", hint: "Gəlib QR oxudub götürə bilərsən" },
      ];
    }

    return [
      ...base,
      { title: "Box yoxdur", hint: "Satıcı QR ilə təhvil verəcək" },
      { title: "Pickup üçün hazırdır", hint: "Marketdə satıcıya yaxınlaş" },
    ];
  }, [handover, reservedBoxNumber]);

  // Timeline animasiya (yalnız mount olandan sonra)
  useEffect(() => {
    if (!mounted) return;

    setActiveStep(0);
    setTimes([]);

    const nowStr = () =>
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const localTimes: string[] = [];
    localTimes[0] = nowStr();
    setTimes([...localTimes]);

    const id = setInterval(() => {
      setActiveStep((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(id);
          return prev;
        }
        localTimes[next] = nowStr();
        setTimes([...localTimes]);
        return next;
      });
    }, 1200);

    return () => clearInterval(id);
  }, [mounted, branchId, slot, handover, steps.length]);

  const payload = useMemo(() => {
    return JSON.stringify({
      orderId: orderId || "SR-PENDING",
      branch: branch.name,
      slot,
      total: Number((mounted ? total : 0).toFixed(2)),
      count: mounted ? count : 0,
      handover,
      boxNumber: reservedBoxNumber,
      status: steps[Math.min(activeStep, steps.length - 1)]?.title,
      action: handover === "box" ? "OPEN_BOX" : "SELLER_SCAN",
    });
  }, [orderId, branch.name, slot, total, count, mounted, handover, reservedBoxNumber, steps, activeStep]);

  useEffect(() => {
    if (!mounted) return;
    QRCode.toDataURL(payload, { width: 240, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [mounted, payload]);

  const availability = useMemo(() => {
    if (!mounted) return { used: 0, available: branch.boxCapacity, capacity: branch.boxCapacity };
    const used = getUsed(branchId, slot);
    const available = Math.max(0, branch.boxCapacity - used);
    return { used, available, capacity: branch.boxCapacity };
  }, [mounted, branchId, slot, branch.boxCapacity]);

  function finishDemo() {
    clear();
    router.push("/products");
  }

  // ✅ mount olmadan SSR ilə uyğun “sabit” render (mismatch olmur)
  if (!mounted) {
    return (
      <div className={styles.wrap}>
        <h1>Ödəniş tamamlandı ✅</h1>
        <p className={styles.sub}>Yüklənir...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1>Ödəniş tamamlandı ✅</h1>
      <p className={styles.sub}>İndi marketə gəl, QR-u oxut və sifarişi götür.</p>

      {handover === "seller_scan" && (
        <div className={styles.alert}>
          <div className={styles.alertTitle}>Box yoxdur</div>
          <div className={styles.alertText}>
            Sizin sifarişi satıcı telefon vasitəsilə QR oxutduqdan sonra sizə təhvil verəcək.
          </div>
        </div>
      )}

      <div className={styles.timeline}>
        <div className={styles.tlTitle}>Pickup statusu</div>
        <div className={styles.steps}>
          {steps.map((s, idx) => {
            const done = idx < activeStep;
            const active = idx === activeStep;

            const dotClass =
              done ? `${styles.dot} ${styles.dotDone}` : active ? `${styles.dot} ${styles.dotActive}` : styles.dot;

            return (
              <div key={idx} className={styles.step}>
                <span className={dotClass} />
                <div>
                  <div className={styles.stepText}>{s.title}</div>
                  <div className={styles.stepHint}>{s.hint}</div>
                </div>
                <div className={styles.time}>{times[idx] ?? ""}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <h3>Pickup seçimi</h3>

          <label className={styles.panelLabel}>Filial</label>
          <select
            className={styles.panelSelect}
            value={branchId}
            onChange={(e) => {
              reservedRef.current = null;
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
              reservedRef.current = null;
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
              <span className={styles.metaKey}>Məhsul sayı:</span>{" "}
              <b suppressHydrationWarning>{count}</b>
            </div>
            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Toplam:</span>{" "}
              <b suppressHydrationWarning>{total.toFixed(2)} ₼</b>
            </div>

            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Box statusu:</span>{" "}
              <b>{handover === "box" ? `Rezerv edildi (Box #${reservedBoxNumber})` : "Mövcud deyil"}</b>
            </div>

            <div className={styles.metaLine}>
              <span className={styles.metaKey}>Box limiti:</span>{" "}
              <b>
                {availability.used}/{availability.capacity} istifadə olunur
              </b>
            </div>
          </div>

          <button className="btn btnGhost" onClick={finishDemo}>
            Demo bitdi (Səbəti sıfırla)
          </button>
        </div>

        <div className={styles.panel}>
          <h3>QR kod</h3>
          <div className={styles.qrBox}>
            {qr ? <img className={styles.qrImg} src={qr} alt="QR" /> : "QR hazırlanır..."}
          </div>
          <div className={styles.note}>
            {handover === "box"
              ? "Video üçün: “Statuslar gedir, sonra QR box-u açır və müştəri götürür.”"
              : "Video üçün: “Box yoxdur, satıcı QR ilə təhvil verir.”"}
          </div>
        </div>
      </div>
    </div>
  );
}
