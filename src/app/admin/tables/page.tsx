"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Download,
  GripVertical,
  Printer,
  QrCode,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";
import { type TableRecord } from "@/lib/app-config";
import { tableSchema, type TableInput } from "@/lib/validations/admin";
import {
  buildTableQrUrl,
  downloadDataUrl,
  downloadQrZip,
  exportQrNodeToPng,
  openQrPrintWindow,
} from "@/utils/qrcode";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40";

function createTableId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `table-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTables(tables: TableRecord[]): TableRecord[] {
  return [...tables]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((table, index) => ({
      ...table,
      sortOrder: index,
    }));
}

interface SortableTableCardProps {
  table: TableRecord;
  qrUrl: string;
  onToggleActive: (tableId: string) => void;
  onDownload: (table: TableRecord) => void;
  onDelete: (table: TableRecord) => void;
  setExportNodeRef: (tableId: string, node: HTMLDivElement | null) => void;
}

function SortableTableCard({
  table,
  qrUrl,
  onToggleActive,
  onDownload,
  onDelete,
  setExportNodeRef,
}: SortableTableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: table.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-opacity ${
        isDragging ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-xl font-bold text-transparent">
            {table.name}
          </h3>
          <p className="mt-1 text-sm text-white/65">Table {table.number}</p>
        </div>

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary transition-all duration-200 hover:bg-primary/20"
          aria-label={`Reorder ${table.name}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <div
          ref={(node) => setExportNodeRef(table.id, node)}
          className="rounded-2xl bg-white p-4 shadow-inner"
        >
          <QRCodeCanvas value={qrUrl} size={200} includeMargin bgColor="#ffffff" fgColor="#111111" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            table.isActive
              ? "bg-green-500/15 text-green-300"
              : "bg-red-500/15 text-red-300"
          }`}
        >
          {table.isActive ? "Active" : "Inactive"}
        </span>

        <button
          type="button"
          onClick={() => onToggleActive(table.id)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
            table.isActive
              ? "border border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
              : "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          {table.isActive ? "Set Inactive" : "Set Active"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onDownload(table)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
        <button
          type="button"
          onClick={() => onDelete(table)}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </article>
  );
}

export default function AdminTablesPage() {
  const { settings } = useAppSettings();
  const tableRows = useQuery(api.restaurantTables.getAll);
  const addTable = useMutation(api.restaurantTables.add);
  const toggleTableActive = useMutation(api.restaurantTables.toggleActive);
  const removeTable = useMutation(api.restaurantTables.remove);
  const reorderTables = useMutation(api.restaurantTables.reorder);
  const [tables, setTables] = useState<TableRecord[]>([]);
  const exportNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const form = useForm<TableInput>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: "",
      number: "",
    },
  });

  useEffect(() => {
    if (tableRows === undefined) {
      return;
    }

    const normalized: TableRecord[] = tableRows.map((row: any) => ({
      id: row.tableId,
      name: row.name,
      number: row.number,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
    }));
    setTables(normalizeTables(normalized));
  }, [tableRows]);

  const sortedTables = useMemo(() => normalizeTables(tables), [tables]);
  const activeTables = useMemo(
    () => sortedTables.filter((table) => table.isActive),
    [sortedTables]
  );

  const setExportNodeRef = (tableId: string, node: HTMLDivElement | null) => {
    exportNodeRefs.current[tableId] = node;
  };

  const getQrUrl = (tableNumber: string) =>
    buildTableQrUrl(settings.restaurant.baseDomain, tableNumber);

  const onSubmit = async (values: TableInput) => {
    const normalizedNumber = values.number.trim();
    const normalizedName = values.name.trim();

    const duplicate = sortedTables.find((table) => table.number === normalizedNumber);
    if (duplicate) {
      form.setError("number", { message: "Table number must be unique" });
      return;
    }

    const tableId = createTableId();
    await addTable({
      tableId,
      name: normalizedName,
      number: normalizedNumber,
      isActive: true,
      sortOrder: sortedTables.length,
    });

    setTables((previous) =>
      normalizeTables([
        ...previous,
        {
          id: tableId,
          name: normalizedName,
          number: normalizedNumber,
          isActive: true,
          sortOrder: previous.length,
        },
      ])
    );
    form.reset();
    toast.success("Table added successfully");
  };

  const handleToggleActive = async (tableId: string) => {
    const target = tables.find((table) => table.id === tableId);
    if (!target) {
      return;
    }

    await toggleTableActive({ tableId, isActive: !target.isActive });
    setTables((previous) =>
      previous.map((table) =>
        table.id === tableId ? { ...table, isActive: !table.isActive } : table
      )
    );
  };

  const handleDelete = async (table: TableRecord) => {
    const confirmed = window.confirm(`Delete ${table.name} (Table ${table.number})?`);
    if (!confirmed) {
      return;
    }

    await removeTable({ tableId: table.id });

    setTables((previous) =>
      normalizeTables(previous.filter((entry) => entry.id !== table.id))
    );
    delete exportNodeRefs.current[table.id];
    toast.success("Table deleted");
  };

  const exportSingleTable = async (table: TableRecord) => {
    const node = exportNodeRefs.current[table.id];
    if (!node) {
      toast.error("QR node is not ready yet");
      return;
    }

    try {
      const dataUrl = await exportQrNodeToPng(node);
      downloadDataUrl(`foodieez-table-${table.number}.png`, dataUrl);
      toast.success(`Downloaded QR for Table ${table.number}`);
    } catch {
      toast.error("Failed to export QR code");
    }
  };

  const collectExportImages = async (targetTables: TableRecord[]) => {
    const images: Array<{ table: TableRecord; dataUrl: string }> = [];

    for (const table of targetTables) {
      const node = exportNodeRefs.current[table.id];
      if (!node) {
        continue;
      }

      const dataUrl = await exportQrNodeToPng(node);
      images.push({ table, dataUrl });
    }

    return images;
  };

  const handleDownloadAll = async () => {
    if (sortedTables.length === 0) {
      toast.error("Add at least one table first");
      return;
    }

    try {
      const images = await collectExportImages(sortedTables);
      await downloadQrZip(
        images.map(({ table, dataUrl }) => ({
          filename: `table-${table.number}.png`,
          dataUrl,
        })),
        "foodieez-table-qrs.zip"
      );
      toast.success("Downloaded QR zip");
    } catch {
      toast.error("Failed to create QR zip");
    }
  };

  const handlePrintAll = async () => {
    if (sortedTables.length === 0) {
      toast.error("Add at least one table first");
      return;
    }

    try {
      const images = await collectExportImages(sortedTables);
      openQrPrintWindow(
        sortedTables,
        images.map(({ table, dataUrl }) => ({ tableId: table.id, dataUrl }))
      );
      toast.success("Opened print layout");
    } catch {
      toast.error("Failed to prepare print layout");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedTables.findIndex((table) => table.id === active.id);
    const newIndex = sortedTables.findIndex((table) => table.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(sortedTables, oldIndex, newIndex).map((table, index) => ({
      ...table,
      sortOrder: index,
    }));
    await reorderTables({
      tables: reordered.map((table) => ({ tableId: table.id, sortOrder: table.sortOrder })),
    });
    setTables(reordered);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
            Table Management
          </h2>
          <p className="mt-2 text-sm text-white/65">
            QR base URL: <span className="font-mono text-primary">{settings.restaurant.baseDomain}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownloadAll}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
          >
            <Download className="h-4 w-4" />
            Download All QR Codes
          </button>
          <button
            type="button"
            onClick={handlePrintAll}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition-all duration-200 hover:border-primary/40 hover:text-primary"
          >
            <Printer className="h-4 w-4" />
            Print All QR Codes
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Add Table</h3>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
                Table Name
              </label>
              <input {...form.register("name")} className={inputClass} placeholder="VIP Corner" />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-red-300">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
                Table Number
              </label>
              <input {...form.register("number")} className={inputClass} placeholder="12" />
              {form.formState.errors.number && (
                <p className="mt-1 text-xs text-red-300">{form.formState.errors.number.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
            >
              <Plus className="h-4 w-4" />
              Add Table
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            <p>Total tables: <span className="text-white">{sortedTables.length}</span></p>
            <p className="mt-1">Active tables: <span className="text-green-300">{activeTables.length}</span></p>
          </div>
        </form>

        <div className="space-y-4">
          {sortedTables.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary/25 bg-white/5 p-10 text-center backdrop-blur-xl">
              <QrCode className="mx-auto h-10 w-10 text-primary/70" />
              <p className="mt-4 text-lg font-semibold text-white">No tables added yet</p>
              <p className="mt-2 text-sm text-white/60">
                Add your first table to generate downloadable QR codes for dine-in ordering.
              </p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedTables.map((table) => table.id)} strategy={rectSortingStrategy}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sortedTables.map((table) => (
                    <SortableTableCard
                      key={table.id}
                      table={table}
                      qrUrl={getQrUrl(table.number)}
                      onToggleActive={handleToggleActive}
                      onDownload={exportSingleTable}
                      onDelete={handleDelete}
                      setExportNodeRef={setExportNodeRef}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </motion.section>
  );
}
