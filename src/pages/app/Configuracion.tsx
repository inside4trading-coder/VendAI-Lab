import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/app/settings/ProfileForm";
import { CompanyForm } from "@/components/app/settings/CompanyForm";
import { SecurityPanel } from "@/components/app/settings/SecurityPanel";
import { PreferencesForm } from "@/components/app/settings/PreferencesForm";
import { RolesPanel } from "@/components/app/settings/RolesPanel";
import { CatalogsPanel } from "@/components/app/settings/CatalogsPanel";
import { useCan } from "@/hooks/settings/useSettings";

export default function Configuracion() {
  useEffect(() => {
    document.title = "Configuración · VendAI";
  }, []);

  const canCatalogs = useCan("manage_catalogs");
  const canRoles = useCan("manage_roles");

  return (
    <section className="container py-10 space-y-8">
      <div>
        <span className="eyebrow">Lab · Configuración</span>
        <h1 className="mt-3 text-[clamp(26px,3.4vw,38px)] leading-tight tracking-tight text-ink">
          Configuración
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Perfil, empresa, seguridad, preferencias, roles y catálogos.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="prefs">Preferencias</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="catalogs">Catálogos</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6"><ProfileForm /></TabsContent>
        <TabsContent value="company" className="mt-6">
          {canCatalogs ? <CompanyForm /> : <NoAccess />}
        </TabsContent>
        <TabsContent value="security" className="mt-6"><SecurityPanel /></TabsContent>
        <TabsContent value="prefs" className="mt-6"><PreferencesForm /></TabsContent>
        <TabsContent value="roles" className="mt-6">
          {canRoles ? <RolesPanel /> : <NoAccess />}
        </TabsContent>
        <TabsContent value="catalogs" className="mt-6">
          {canCatalogs ? <CatalogsPanel /> : <NoAccess />}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function NoAccess() {
  return (
    <div className="rounded-lg border border-line bg-muted/40 p-6 text-sm text-muted-foreground">
      No tienes permisos para acceder a esta sección. Necesitas el rol de Administrador.
    </div>
  );
}
