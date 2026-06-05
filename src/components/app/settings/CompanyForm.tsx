import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCompanySettings, useUpdateCompany } from "@/hooks/settings/useSettings";

const CURRENCIES = ["EUR", "USD", "MXN", "COP", "ARS"];
const TIMEZONES = [
  "Europe/Madrid", "Europe/Lisbon", "Europe/London", "America/Mexico_City",
  "America/Bogota", "America/Argentina/Buenos_Aires", "America/New_York", "UTC",
];

interface FormData {
  name: string; tax_id: string; address: string;
  logo_url: string; currency: string; timezone: string;
}

export function CompanyForm() {
  const { data } = useCompanySettings();
  const update = useUpdateCompany();
  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<FormData>({
    defaultValues: { name: "", tax_id: "", address: "", logo_url: "", currency: "EUR", timezone: "Europe/Madrid" },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name ?? "",
        tax_id: data.tax_id ?? "",
        address: data.address ?? "",
        logo_url: data.logo_url ?? "",
        currency: data.currency,
        timezone: data.timezone,
      });
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await update.mutateAsync({
        name: v.name.trim() || null,
        tax_id: v.tax_id.trim() || null,
        address: v.address.trim() || null,
        logo_url: v.logo_url.trim() || null,
        currency: v.currency,
        timezone: v.timezone,
      });
      toast.success("Datos de empresa guardados");
    } catch (e) {
      toast.error((e as Error).message);
    }
  });

  const currency = watch("currency");
  const timezone = watch("timezone");

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la empresa</Label>
        <Input id="name" maxLength={120} {...register("name")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax_id">NIF / CIF</Label>
          <Input id="tax_id" maxLength={30} {...register("tax_id")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo_url">URL del logo</Label>
          <Input id="logo_url" type="url" maxLength={500} {...register("logo_url")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Textarea id="address" maxLength={300} rows={2} {...register("address")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Select value={currency} onValueChange={(v) => setValue("currency", v, { shouldDirty: true })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Zona horaria</Label>
          <Select value={timezone} onValueChange={(v) => setValue("timezone", v, { shouldDirty: true })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={!formState.isDirty || update.isPending}>
        {update.isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
