// ============================================
// Crazy Fun Boxing - Page Component
// ============================================

import { BoxingProvider } from "@/contexts/BoxingContext";
import { BoxingGame } from "@/components/boxing/BoxingGame";

export default function BoxingPage() {
  return (
    <BoxingProvider>
      <BoxingGame />
    </BoxingProvider>
  );
}
