import { useState } from "react";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useActivityTypes, useCatalogMutations, useLeadCategories, useProductCatalog,
} from "@/hooks/settings/useSettings";

type Row = { id: string } & Record<string, unknown>;

function CatalogList({
  table, rows, columns, isLoading,
}: {
  table: "lead_categories" | "activity_types" | "product_catalog";
  rows: Row[];
  columns: { key: string; label: string; type?: "text" | "number"; placeholder?: string }[];
  isLoading?: boolean;
}) {
  const { create, update, remove } = useCatalogMutations(table);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState<Record<string, string>>({});

  const startEdit = (row: Row) => {
    setEditing(row.id);
    const d: Record<string, string> = {};
    columns.forEach((c) => { d[c.key] = String(row[c.key] ?? ""); });
    setDraft(d);
  };

  const submitEdit = async (id: string) => {
    try {
      const patch: Record<string, unknown> = {};
      columns.forEach((c) => {
        const v = draft[c.key]?.trim() ?? "";
        patch[c.key] = c.type === "number" ? Number(v || 0) : (v || null);
      });
      await update.mutateAsync({ id, patch });
      setEditing(null);
      toast.success("Guardado");
    } catch (e) { toast.error((e as Error).message); }
  };

  const submitAdd = async () => {
    const required = columns[0].key;
    if (!adding[required]?.trim()) return;
    try {
      const row: Record<string, unknown> = {};
      columns.forEach((c) => {
        const v = adding[c.key]?.trim() ?? "";
        row[c.key] = c.type === "number" ? Number(v || 0) : (v || null);
      });
      await create.mutateAsync(row);
      setAdding({});
      toast.success("Añadido");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay elementos.</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2 rounded-md border border-line p-2">
              {editing === row.id ? (
                <>
                  {columns.map((c) => (
                    <Input
                      key={c.key}
                      type={c.type ?? "text"}
                      value={draft[c.key] ?? ""}
                      onChange={(e) => setDraft({ ...draft, [c.key]: e.target.value })}
                      placeholder={c.placeholder ?? c.label}
                      className="h-8"
                    />
                  ))}
                  <Button size="icon" variant="ghost" onClick={() => submitEdit(row.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  {columns.map((c) => (
                    <span key={c.key} className="flex-1 text-sm text-ink truncate">
                      {String(row[c.key] ?? "—")}
                    </span>
                  ))}
                  <Button size="icon" variant="ghost" onClick={() => startEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => remove.mutate(row.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 rounded-md border border-dashed border-line p-2">
        {columns.map((c) => (
          <Input
            key={c.key}
            type={c.type ?? "text"}
            value={adding[c.key] ?? ""}
            onChange={(e) => setAdding({ ...adding, [c.key]: e.target.value })}
            placeholder={c.placeholder ?? c.label}
            className="h-8"
          />
        ))}
        <Button size="icon" onClick={submitAdd} disabled={create.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function CatalogsPanel() {
  const cats = useLeadCategories();
  const types = useActivityTypes();
  const products = useProductCatalog();

  return (
    <Tabs defaultValue="categories" className="max-w-3xl">
      <TabsList>
        <TabsTrigger value="categories">Categorías de leads</TabsTrigger>
        <TabsTrigger value="types">Tipos de actividad</TabsTrigger>
        <TabsTrigger value="products">Productos</TabsTrigger>
      </TabsList>
      <TabsContent value="categories" className="mt-5">
        <CatalogList
          table="lead_categories"
          rows={(cats.data ?? []) as unknown as Row[]}
          isLoading={cats.isLoading}
          columns={[{ key: "name", label: "Nombre", placeholder: "Ej. Gimnasios" }]}
        />
      </TabsContent>
      <TabsContent value="types" className="mt-5">
        <CatalogList
          table="activity_types"
          rows={(types.data ?? []) as unknown as Row[]}
          isLoading={types.isLoading}
          columns={[
            { key: "code", label: "Código", placeholder: "ej. visita" },
            { key: "label", label: "Etiqueta", placeholder: "Visita" },
          ]}
        />
      </TabsContent>
      <TabsContent value="products" className="mt-5">
        <CatalogList
          table="product_catalog"
          rows={(products.data ?? []) as unknown as Row[]}
          isLoading={products.isLoading}
          columns={[
            { key: "name", label: "Producto", placeholder: "Nombre" },
            { key: "default_price", label: "Precio", type: "number", placeholder: "0.00" },
            { key: "sku", label: "SKU", placeholder: "(opcional)" },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}
