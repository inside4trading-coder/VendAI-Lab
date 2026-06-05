import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/settings/useSettings";

interface FormData { full_name: string; phone: string; avatar_url: string }

export function ProfileForm() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { register, handleSubmit, reset, formState } = useForm<FormData>({
    defaultValues: { full_name: "", phone: "", avatar_url: "" },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        avatar_url: profile.avatar_url ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await update.mutateAsync({
        full_name: v.full_name.trim() || null,
        phone: v.phone.trim() || null,
        avatar_url: v.avatar_url.trim() || null,
      });
      toast.success("Perfil actualizado");
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user?.email ?? ""} readOnly disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input id="full_name" maxLength={100} {...register("full_name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" maxLength={30} {...register("phone")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatar_url">URL del avatar</Label>
        <Input id="avatar_url" type="url" maxLength={500} {...register("avatar_url")} />
      </div>
      <Button type="submit" disabled={!formState.isDirty || update.isPending}>
        {update.isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
