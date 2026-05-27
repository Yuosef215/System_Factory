import html2pdf from "html2pdf.js";

function generateAndDownload(htmlContent, filename) {
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  html2pdf()
    .set({
      margin: 10,
      filename,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .save()
    .then(() => document.body.removeChild(container));
}

// ── مساعد: صف جدول ──
const row = (cells) =>
  `<tr>${cells.map((c) => `<td style="border:1px solid #ddd;padding:7px 10px;text-align:right;">${c ?? "-"}</td>`).join("")}</tr>`;

const headerRow = (cells) =>
  `<tr>${cells.map((c) => `<th style="background:#ea580c;color:#fff;padding:8px 10px;text-align:right;border:1px solid #c2410c;">${c}</th>`).join("")}</tr>`;

// ── Header مشترك ──
function docHeader(title, reportNumber, by, date) {
  return `
    <img src={}/>
    <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;padding:20px;">
      <div style="text-align:center;border-bottom:2px solid #4d5564;padding-bottom:12px;margin-bottom:16px;">
        <h2 style="margin:0;font-size:20px;color:#111;">Iron Factory System</h2>
        <h3 style="margin:4px 0 0;font-size:15px;color:#ea580c;">${title}</h3>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#555;margin-bottom:14px;">
        <span>رقم المحضر: <strong style="color:#111;">${reportNumber}</strong></span>
        <span>بواسطة: <strong style="color:#111;">${by || "-"}</strong></span>
        <span>التاريخ: <strong style="color:#111;">${date ? new Date(date).toLocaleDateString("ar-EG") : "-"}</strong></span>
      </div>
  `;
}

// ── 1. طلب الشراء ──
export function printPurchaseRequest(request) {
  const html = `
    ${docHeader("طلب شراء", request.reportNumber, request.requestedBy, request.createdAt)}
    <div style="font-size:12px;margin-bottom:12px;display:flex;gap:24px;">
      <span>المهندس المختص: <strong>${request.specialized_engineer || "-"}</strong></span>
      <span>الحالة: <strong>${request.status}</strong></span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      ${headerRow(["#", "الوصف", "الكمية", "الوحدة", "الجهة الطالبة"])}
      ${request.items.map((item, i) => row([i + 1, item.description, item.quantity, item.unit, item.Requesting_party])).join("")}
    </table>
    ${request.notes ? `<p style="margin-top:14px;font-size:12px;color:#555;">ملاحظات: ${request.notes}</p>` : ""}
    </div>
  `;
  generateAndDownload(html, `PurchaseRequest_${request.reportNumber}.pdf`);
}

// ── 2. عرض السعر ──
export function printPriceOffer(offer) {
  const html = `
    ${docHeader("عرض سعر", offer.reportNumber, offer.offeredBy, offer.createdAt)}
    <div style="font-size:12px;margin-bottom:12px;display:flex;gap:24px;">
      <span>الحالة: <strong>${offer.status}</strong></span>
      <span>الإجمالي: <strong style="color:#ea580c;">${offer.totalAmount?.toLocaleString()} جنيه</strong></span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      ${headerRow(["#", "الوصف", "الكمية", "سعر الوحدة", "الإجمالي", "المورد"])}
      ${offer.items.map((item, i) => row([i + 1, item.description, item.quantity, `${item.unitPrice?.toLocaleString()} ج`, `${item.totalPrice?.toLocaleString()} ج`, item.supplier])).join("")}
    </table>
    ${offer.gmNotes ? `<p style="margin-top:14px;font-size:12px;color:#555;">ملاحظات المدير: ${offer.gmNotes}</p>` : ""}
    </div>
  `;
  generateAndDownload(html, `PriceOffer_${offer.reportNumber}.pdf`);
}

// ── 3. أمر الشراء ──
export function printPurchaseOrder(order) {
  const html = `
    ${docHeader("أمر شراء", order.reportNumber, order.confirmedBy, order.createdAt)}
    <div style="font-size:12px;margin-bottom:12px;display:flex;gap:24px;">
      <span>الحالة: <strong>${order.status}</strong></span>
      <span>الإجمالي: <strong style="color:#ea580c;">${order.totalAmount?.toLocaleString()} جنيه</strong></span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      ${headerRow(["#", "الوصف", "الكمية المطلوبة", "الكمية المستلمة", "سعر الوحدة", "الإجمالي", "الحالة"])}
      ${order.items.map((item, i) => row([i + 1, item.description, item.quantity, item.receivedQuantity, `${item.unitPrice?.toLocaleString()} ج`, `${item.totalPrice?.toLocaleString()} ج`, item.status])).join("")}
    </table>
    </div>
  `;
  generateAndDownload(html, `PurchaseOrder_${order.reportNumber}.pdf`);
}

// ── 4. تقرير الفحص ──
export function printInspectionReport(report) {
  const html = `
    ${docHeader("تقرير فحص واستلام", report.reportNumber, report.inspectedBy, report.createdAt)}
    <div style="font-size:12px;margin-bottom:12px;display:flex;gap:24px;">
      <span>الحالة: <strong>${report.status}</strong></span>
      <span>أضيف للمخزن: <strong>${report.addedToInventory ? "نعم ✅" : "لا ❌"}</strong></span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      ${headerRow(["#", "الوصف", "الكمية المطلوبة", "الكمية المستلمة", "الحالة", "ملاحظات"])}
      ${report.items.map((item, i) => row([i + 1, item.description, item.quantityOrdered, item.quantityReceived, item.status, item.notes])).join("")}
    </table>
    ${report.generalNotes ? `<p style="margin-top:14px;font-size:12px;color:#555;">ملاحظات عامة: ${report.generalNotes}</p>` : ""}
    </div>
  `;
  generateAndDownload(html, `Inspection_${report.reportNumber}.pdf`);
}

// ── 5. الصرف اليومي ──
export function printDailyMovements(movements, date) {
  const html = `
    <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;padding:20px;">
      <div style="text-align:center;border-bottom:2px solid #ea580c;padding-bottom:12px;margin-bottom:16px;">
        <h2 style="margin:0;font-size:20px;">Iron Factory System</h2>
        <h3 style="margin:4px 0 0;color:#ea580c;">الصرف اليومي</h3>
        <p style="margin:4px 0 0;font-size:12px;color:#555;">التاريخ: ${date} — إجمالي الحركات: ${movements.length}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        ${headerRow(["الصنف", "الماركة", "العملية", "الكمية", "قبل", "بعد", "السبب", "بواسطة", "الوقت"])}
        ${movements.map((m) => row([
          m.ballBearing?.code || m.code,
          m.ballBearing?.brandtype || "-",
          m.process,
          m.quantity,
          m.balanceBefore,
          m.balanceAfter,
          m.reason,
          m.createdBy,
          new Date(m.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        ])).join("")}
      </table>
    </div>
  `;
  generateAndDownload(html, `DailyMovements_${date}.pdf`);
}

// ── 6. صرف منتج معين ──
export function printItemMovements(movements, item) {
  const html = `
    <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;padding:20px;">
      <div style="text-align:center;border-bottom:2px solid #ea580c;padding-bottom:12px;margin-bottom:16px;">
        <h2 style="margin:0;font-size:20px;">Iron Factory System</h2>
        <h3 style="margin:4px 0 0;color:#ea580c;">حركات صنف</h3>
        <p style="margin:4px 0 0;font-size:13px;">${item.brandtype} — ${item.code}</p>
        <p style="margin:2px 0 0;font-size:12px;color:#555;">الرصيد الحالي: ${item.stock}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        ${headerRow(["التاريخ", "العملية", "الكمية", "قبل", "بعد", "السبب", "بواسطة"])}
        ${movements.map((m) => row([
          new Date(m.createdAt).toLocaleDateString("ar-EG"),
          m.process,
          m.quantity,
          m.balanceBefore,
          m.balanceAfter,
          m.reason,
          m.createdBy,
        ])).join("")}
      </table>
    </div>
  `;
  generateAndDownload(html, `Movements_${item.code}.pdf`);
}