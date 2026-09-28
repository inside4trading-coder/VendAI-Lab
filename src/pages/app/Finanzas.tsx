import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { SimuladorPanel } from "@/components/app/finance/SimuladorPanel";
import { LedgerPanel } from "@/components/app/finance/LedgerPanel";

const TABS = ["simulador", "ledger"] as const;
type FinanzasTab = (typeof TABS)[number];

const isTab = (value: string | null): value is FinanzasTab =>
  TABS.includes(value as FinanzasTab);

export default function Finanzas() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab: FinanzasTab = isTab(tabParam) ? tabParam : "simulador";

  useEffect(() => {
    document.title = "Finanzas · VendAI";
  }, []);

  return (
    <section className="w-full px-6 lg:px-10 py-10 space-y-6">
      <div>
        <span className="eyebrow">Lab · Finanzas</span>
        <h1 className="mt-3 text-[clamp(26px,3.4vw,38px)] leading-tight tracking-tight text-ink">Finanzas</h1>
        <p className="mt-2 text-[15px] text-muted-foreground max-w-xl">
          Simula la rentabilidad por máquina y lleva el ledger de caja del proyecto.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="simulador">Simulador</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="simulador" className="mt-6">
          <SimuladorPanel />
        </TabsContent>
        <TabsContent value="ledger" className="mt-6">
          <LedgerPanel currentUserId={user?.id ?? null} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
