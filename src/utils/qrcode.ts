import { toPng } from "html-to-image";
import JSZip from "jszip";
import type { TableRecord } from "@/lib/app-config";

/**
 * Builds the customer-facing QR destination for a table.
 */
export function buildTableQrUrl(baseDomain: string, tableNumber: string): string {
  const normalizedBase = baseDomain.trim().replace(/\/$/, "") || "https://foodieezjunction.com";
  return `${normalizedBase}?table=${encodeURIComponent(tableNumber)}`;
}

/**
 * Converts a QR DOM node into a high-resolution PNG data URL.
 */
export async function exportQrNodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    canvasWidth: 1024,
    canvasHeight: 1024,
    backgroundColor: "#ffffff",
  });
}

/**
 * Triggers download of a PNG data URL.
 */
export function downloadDataUrl(filename: string, dataUrl: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

/**
 * Bundles multiple QR PNGs into a zip file and downloads it.
 */
export async function downloadQrZip(
  entries: Array<{ filename: string; dataUrl: string }>,
  zipName: string
): Promise<void> {
  const zip = new JSZip();

  for (const entry of entries) {
    const base64 = entry.dataUrl.split(",")[1];
    zip.file(entry.filename, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(zipName, url);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Opens a print-friendly window with QR cards for selected tables.
 */
export function openQrPrintWindow(
  tables: TableRecord[],
  dataUrls: Array<{ tableId: string; dataUrl: string }>
): void {
  const mapped = new Map(dataUrls.map((entry) => [entry.tableId, entry.dataUrl]));
  const html = tables
    .map((table) => {
      const image = mapped.get(table.id);
      if (!image) {
        return "";
      }

      return `
        <article class="card">
          <h2>${table.name}</h2>
          <p>Table ${table.number}</p>
          <img src="${image}" alt="QR for ${table.name}" />
        </article>
      `;
    })
    .join("");

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Foodieez Junction QR Codes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
          .card { border: 1px solid #ddd; border-radius: 16px; padding: 24px; text-align: center; page-break-inside: avoid; }
          h2 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 0 0 16px; color: #555; }
          img { width: 320px; height: 320px; object-fit: contain; }
          @media print { body { margin: 0; } .grid { gap: 16px; } }
        </style>
      </head>
      <body>
        <div class="grid">${html}</div>
        <script>
          window.onload = function() {
            window.print();
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
