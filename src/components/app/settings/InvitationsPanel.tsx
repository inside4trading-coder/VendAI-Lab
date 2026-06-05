import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Copy, Send, Trash2, XCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { APP_ROLES, ROLE_LABEL, type AppRole } from "@/lib/permissions";
import {
  useRoleInvitations,
  useCreateInvitation,
  useRevokeInvitation,
  useDeleteInvitation,
} from "@/hooks/settings/useSettings";

const emailSchema = z.string().trim().email("Email inválido").max(255);

function statusBadge(status: string, expiresAt: string) {
  const expired = status === "pending" && new Date(expiresAt).getTime() < Date.now();
  const s = expired ? "expired" : status;
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pendiente", cls: "border-amber-500/40 text-amber-500" },
    accepted: { label: "Aceptada", cls: "border-crypto-green/40 text-crypto-green" },
    revoked: { label: "Revocada", cls: "border-muted-foreground/40 text-muted-foreground" },
    expired: { label: "Caducada", cls: "border-destructive/40 text-destructive" },
  };
  const v = map[s] ?? map.pending;
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}

export function InvitationsPanel({ canManage }: { canManage: boolean }) {
  const { data: invites = [], isLoading } = useRoleInvitations();
  const create = useCreateInvitation();
  const revoke = useRevokeInvitation();
  const del = useDeleteInvitation();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("operador");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    try {
      await create.mutateAsync({ email: parsed.data, role });
      toast.success(`Invitación enviada a ${parsed.data}`);
      setEmail("");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/auth?invite=${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-ink">Invitar nuevo usuario</h3>
        <p className="text-sm text-muted-foreground">
          Cuando el invitado se registre con este email, recibirá automáticamente el rol asignado.
          Las invitaciones caducan a los 7 días.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          placeholder="email@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!canManage || create.isPending}
          className="flex-1"
        />
        <Select value={role} onValueChange={(v) => setRole(v as AppRole)} disabled={!canManage}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APP_ROLES.map((r) => (
              <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={!canManage || create.isPending}>
          <Send className="h-4 w-4 mr-2" />
          Invitar
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="font-semibold text-ink">Invitaciones enviadas</h3>
        <div className="rounded-lg border border-line overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Cargando…</TableCell></TableRow>
              ) : invites.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin invitaciones</TableCell></TableRow>
              ) : invites.map((inv) => {
                const isPending = inv.status === "pending" && new Date(inv.expires_at).getTime() > Date.now();
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>{ROLE_LABEL[inv.role]}</TableCell>
                    <TableCell>{statusBadge(inv.status, inv.expires_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isPending && (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => copyLink(inv.token)} title="Copiar enlace">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => revoke.mutate(inv.id)}
                              disabled={!canManage}
                              title="Revocar"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => del.mutate(inv.id)}
                          disabled={!canManage}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
