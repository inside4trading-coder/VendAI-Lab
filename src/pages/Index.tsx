import { Hero } from "@/components/landing/Hero";
import { Servicios } from "@/components/landing/Servicios";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { ParaQuien } from "@/components/landing/ParaQuien";
import { Modelo } from "@/components/landing/Modelo";
import { Contacto } from "@/components/landing/Contacto";

export default function Index() {
  return (
    <>
      <Hero />
      <Servicios />
      <ComoFunciona />
      <ParaQuien />
      <Modelo />
      <Contacto />
    </>
  );
}
