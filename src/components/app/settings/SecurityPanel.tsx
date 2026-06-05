import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function SecurityPanel() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) return toast.error("La contraseña debe tener al menos 8 caracteres");
    if (pwd !== pwd2) return toast.error("Las contraseñas no coinciden");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPwd(""); setPwd2("");
    toast.success("Contraseña actualizada");
  };

  const signOutEverywhere = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) return toast.error(error.message);
    toast.success("Sesión cerrada en todos los dispositivos");
    navigate("/auth", { replace: true });
  };

  const deleteAccount = async () => {
    if (confirmText !== "ELIMINAR") return toast.error("Escribe ELIMINAR para confirmar");
    setBusy(true);
    const { error } = await supabase.functions.invoke("delete-account");
    setBusy(false);
    if (error) return toast.error(error.message);
    await signOut();
    navigate("/", { replace: true });
    toast.success("Cuenta eliminada");
  };

  return (
    <div className="space-y-8 max-w-xl">
      <form onSubmit={changePassword} className="space-y-4">
        <h3 className="font-semibold text-ink">Cambiar contraseña</h3>
        <div className="space-y-2">
          <Label htmlFor="pwd">Nueva contraseña</Label>
          <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} minLength={8} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pwd2">Confirmar contraseña</Label>
          <Input id="pwd2" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} minLength={8} />
        </div>
        <Button type="submit" disabled={busy || !pwd || !pwd2}>Actualizar contraseña</Button>
      </form>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-semibold text-ink">Sesiones</h3>
        <p className="text-sm text-muted-foreground">Cierra sesión en todos los dispositivos donde hayas iniciado.</p>
        <Button variant="outline" onClick={signOutEverywhere}>Cerrar sesión en todos los dispositivos</Button>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-semibold text-destructive">Zona peligrosa</h3>
        <p className="text-sm text-muted-foreground">
          Eliminar tu cuenta borra de forma permanente todos tus leads, máquinas, ventas y configuración.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Eliminar mi cuenta</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción es irreversible. Escribe <strong>ELIMINAR</strong> para confirmar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="ELIMINAR" />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText("")}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount} disabled={busy} className="bg-destructive text-destructive-foreground">
                Eliminar definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
