import { useState } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { parseWorkbook, type ParsedSheet } from "@/lib/crm-import";
import { useImportLeads } from "@/hooks/crm/useLeads";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportLeadsDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const importMut = useImportLeads();

  const [sheets, setSheets] = useState<ParsedSheet[] | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const reset = () => {
    setSheets(null);
    setSelected({});
    setFileName(null);
    setParseError(null);
    setProgress(null);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFile = async (file: File) => {
    setParseError(null);
    setFileName(file.name);
    try {
      const parsed = await parseWorkbook(file);
      setSheets(parsed);
      const sel: Record<string, boolean> = {};
      parsed.forEach((s) => (sel[s.sheetName] = s.rows.length > 0));
      setSelected(sel);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "No pudimos leer el archivo");
      setSheets(null);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const toImport = sheets
    ? sheets.filter((s) => selected[s.sheetName]).flatMap((s) => s.rows)
    : [];
  const totalSkipped = sheets ? sheets.reduce((a, s) => a + s.skipped, 0) : 0;
  const preview = toImport.slice(0, 8);

  const handleImport = async () => {
    if (toImport.length === 0) return;
    setProgress({ done: 0, total: toImport.length });
    try {
      await importMut.mutateAsync({
        leads: toImport,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      toast({ title: `Se importaron ${toImport.length} leads` });
      handleClose(false);
    } catch (e) {
      toast({
        title: "Error al importar",
        description: e instanceof Error ? e.message : "Inténtalo de nuevo",
        variant: "destructive",
      });
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar leads</DialogTitle>
          <DialogDescription>
            Sube un archivo Excel o CSV con tus prospectos. Reconoce columnas como Negocio,
            Categoría, Dirección, Teléfono, Email, Web, Rating y Notas.
          </DialogDescription>
        </DialogHeader>

        {!sheets && (
          <label
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-line rounded-xl p-10 cursor-pointer hover:bg-panel transition-colors"
          >
            <Upload className="h-8 w-8 text-faint" strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-sm text-ink font-medium">
                Arrastra un archivo o haz clic para seleccionar
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                .xlsx, .xls o .csv — máx. 10 MB
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onInputChange}
              className="hidden"
            />
          </label>
        )}

        {parseError && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {sheets && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="truncate">{fileName}</span>
              <button
                onClick={reset}
                className="ml-auto font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink hover:underline"
              >
                Cambiar
              </button>
            </div>

            <div className="bg-panel border border-line rounded-lg p-3 space-y-2">
              <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground">
                Pestañas detectadas
              </p>
              {sheets.map((s) => (
                <label
                  key={s.sheetName}
                  className="flex items-center gap-3 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={!!selected[s.sheetName]}
                    onCheckedChange={(v) =>
                      setSelected((prev) => ({ ...prev, [s.sheetName]: !!v }))
                    }
                    disabled={s.rows.length === 0}
                  />
                  <span className="text-ink font-medium">{s.sheetName}</span>
                  <span className="text-muted-foreground">
                    {s.rows.length} válidas
                    {s.skipped > 0 && ` · ${s.skipped} descartadas`}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-ink font-medium">
                {toImport.length} leads listos para importar
              </span>
              {totalSkipped > 0 && (
                <span className="text-xs text-muted-foreground">
                  {totalSkipped} filas sin nombre fueron descartadas
                </span>
              )}
            </div>

            {preview.length > 0 && (
              <div className="border border-line rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-panel font-mono text-[10.5px] tracking-[0.12em] uppercase text-muted-foreground">
                      <tr>
                        <th className="text-left p-2 font-normal">Nombre</th>
                        <th className="text-left p-2 font-normal">Categoría</th>
                        <th className="text-left p-2 font-normal">Teléfono</th>
                        <th className="text-left p-2 font-normal">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((l, i) => (
                        <tr key={i} className="border-t border-line">
                          <td className="p-2 text-ink truncate max-w-[200px]">{l.name}</td>
                          <td className="p-2 text-muted-foreground">{l.category}</td>
                          <td className="p-2 text-muted-foreground">{l.phone ?? "—"}</td>
                          <td className="p-2 text-muted-foreground truncate max-w-[180px]">
                            {l.email ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {toImport.length > preview.length && (
                  <div className="bg-panel px-2 py-1.5 text-[11px] text-muted-foreground border-t border-line">
                    Vista previa de {preview.length} de {toImport.length} filas
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Las filas duplicadas se importarán como nuevos leads.
            </p>

            {progress && (
              <div className="space-y-1.5">
                <Progress value={(progress.done / progress.total) * 100} />
                <p className="text-xs text-muted-foreground text-center">
                  Importando {progress.done} de {progress.total}…
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <button
            onClick={() => handleClose(false)}
            disabled={importMut.isPending}
            className="font-mono text-[12px] tracking-[0.08em] uppercase text-muted-foreground hover:text-ink px-4 py-2.5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!sheets || toImport.length === 0 || importMut.isPending}
            className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 hover:bg-ink-2 transition-colors disabled:opacity-50"
          >
            {importMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Importar {toImport.length > 0 ? `${toImport.length} leads` : ""}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
