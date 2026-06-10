import { Outlet } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export default function SiteLayout() {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen flex flex-col bg-paper">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </LazyMotion>
  );
}
