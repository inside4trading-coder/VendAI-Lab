import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { usePreferences, useUpdatePreferences } from "@/hooks/settings/useSettings";

export function PreferencesForm() {
  const { data: prefs } = usePreferences();
  const update = useUpdatePreferences();

  if (!prefs) return null;

  const save = async (patch: Parameters<typeof update.mutateAsync>[0]) => {
    try {
      await update.mutateAsync(patch);
      toast.success("Preferencias guardadas");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      <div className="space-y-3">
        <Label>Tema</Label>
        <RadioGroup
          value={prefs.theme}
          onValueChange={(v) => save({ theme: v as "light" | "dark" | "system" })}
          className="flex gap-6"
        >
          {(["light", "dark", "system"] as const).map((t) => (
            <div key={t} className="flex items-center gap-2">
              <RadioGroupItem value={t} id={`theme-${t}`} />
              <Label htmlFor={`theme-${t}`} className="font-normal capitalize">
                {t === "light" ? "Claro" : t === "dark" ? "Oscuro" : "Sistema"}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Idioma</Label>
        <Select value={prefs.language} onValueChange={(v) => save({ language: v as "es" | "en" })}>
          <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">La traducción de la interfaz llega próximamente.</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Densidad de tablas</Label>
        <RadioGroup
          value={prefs.table_density}
          onValueChange={(v) => save({ table_density: v as "comfortable" | "compact" })}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="comfortable" id="d-comfort" />
            <Label htmlFor="d-comfort" className="font-normal">Cómoda</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="compact" id="d-compact" />
            <Label htmlFor="d-compact" className="font-normal">Compacta</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Notificaciones</Label>
        <div className="flex items-center justify-between">
          <span className="text-sm">Email</span>
          <Switch checked={prefs.notify_email} onCheckedChange={(v) => save({ notify_email: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">En la app</span>
          <Switch checked={prefs.notify_in_app} onCheckedChange={(v) => save({ notify_in_app: v })} />
        </div>
      </div>
    </div>
  );
}
