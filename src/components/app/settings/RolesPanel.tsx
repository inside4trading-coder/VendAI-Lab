import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, Plus, X } from "lucide-react";
import { APP_ROLES, ROLE_DESCRIPTION, ROLE_LABEL, type AppRole } from "@/lib/permissions";
import {
  useAddRole, useRemoveRole, useUserRoles,
} from "@/hooks/settings/useSettings";
import { InvitationsPanel } from "./InvitationsPanel";
import { toast } from "sonner";

export function RolesPanel() {
  const { data: roles = [] } = useUserRoles();
  const add = useAddRole();
  const remove = useRemoveRole();
  const isAdmin = roles.includes("admin");

  const toggle = async (role: AppRole) => {
    try {
      if (roles.includes(role)) {
        await remove.mutateAsync(role);
        toast.success(`Rol ${ROLE_LABEL[role]} retirado`);
      } else {
        await add.mutateAsync(role);
        toast.success(`Rol ${ROLE_LABEL[role]} añadido`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h3 className="font-semibold text-ink">Tus roles actuales</h3>
        <div className="flex flex-wrap gap-2">
          {roles.length === 0 ? (
            <span className="text-sm text-muted-foreground">Sin roles asignados</span>
          ) : (
            roles.map((r) => <Badge key={r} variant="secondary">{ROLE_LABEL[r]}</Badge>)
          )}
        </div>
      </div>

      <Separator />

      {!isAdmin && (
        <div className="rounded-lg border border-line bg-muted/40 p-4 flex items-start gap-3">
          <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Solo un usuario con rol <strong>Administrador</strong> puede modificar roles.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-ink">Matriz de roles</h3>
        {APP_ROLES.map((r) => {
          const active = roles.includes(r);
          return (
            <div
              key={r}
              className="flex items-start justify-between gap-4 rounded-lg border border-line p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{ROLE_LABEL[r]}</span>
                  {active && <Badge variant="outline" className="text-crypto-green border-crypto-green/40">Activo</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{ROLE_DESCRIPTION[r]}</p>
              </div>
              <Button
                size="sm"
                variant={active ? "outline" : "default"}
                disabled={!isAdmin || (r === "admin" && active && roles.length === 1)}
                onClick={() => toggle(r)}
              >
                {active ? <><X className="h-3.5 w-3.5 mr-1" />Quitar</> : <><Plus className="h-3.5 w-3.5 mr-1" />Añadir</>}
              </Button>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-1">
        <h3 className="font-semibold text-ink">Invitaciones</h3>
        <p className="text-sm text-muted-foreground">
          Asigna un rol a un email antes de que el usuario se registre.
        </p>
      </div>
      <InvitationsPanel canManage={isAdmin} />
    </div>
  );
}
