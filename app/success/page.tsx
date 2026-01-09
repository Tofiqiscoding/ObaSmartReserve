import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 18 }}>Yüklənir...</div>}>
      <SuccessClient />
    </Suspense>
  );
}
