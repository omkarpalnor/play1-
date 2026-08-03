const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const escapeCsv = (value) => {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const getBrandLogoUrl = () => `${window.location.origin}/logo1.png`;

const renderKeyValueList = (items = [], columns = 2) => {
  if (!items.length) {
    return "";
  }

  return `
    <div style="display:grid;grid-template-columns:repeat(${columns}, minmax(0, 1fr));gap:12px;">
      ${items
        .map(
          (item) => `
            <div style="padding:12px 14px;border:1px solid #d6dae3;border-radius:14px;background:#ffffff;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#667085;">
                ${escapeHtml(item.label)}
              </div>
              <div style="margin-top:6px;font-size:18px;font-weight:700;color:#101828;">
                ${escapeHtml(item.value)}
              </div>
              ${
                item.note
                  ? `<div style="margin-top:6px;font-size:12px;line-height:1.5;color:#667085;">${escapeHtml(item.note)}</div>`
                  : ""
              }
            </div>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderSectionTable = (section) => {
  const headers = section.headers || [];
  const rows = section.rows || [];

  if (!headers.length || !rows.length) {
    return `
      <div style="padding:18px;border:1px dashed #d0d5dd;border-radius:16px;color:#667085;font-size:12px;">
        No data available for this section in the selected report window.
      </div>
    `;
  }

  return `
    <div style="overflow:hidden;border:1px solid #d6dae3;border-radius:16px;">
      <table style="border-collapse:collapse;width:100%;font-size:12px;">
        <thead>
          <tr>
            ${headers
              .map(
                (header) => `
                  <th style="text-align:left;padding:11px 12px;background:#f8fafc;border-bottom:1px solid #d6dae3;color:#344054;">
                    ${escapeHtml(header)}
                  </th>
                `,
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row, index) => `
                <tr style="background:${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                  ${row
                    .map(
                      (cell) => `
                        <td style="padding:10px 12px;border-bottom:1px solid #eaecf0;color:#101828;">
                          ${escapeHtml(cell)}
                        </td>
                      `,
                    )
                    .join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
};

export const downloadCsvReport = ({ fileName, headers, rows }) => {
  const csvContent = [
    headers.map((header) => escapeCsv(header.label)).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header.key])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printPdfReport = ({
  title,
  subtitle,
  headers,
  rows,
  summary,
  filters = [],
  highlights = [],
  sections = [],
  reportLabel = "Report",
}) => {
  const reportWindow = window.open("", "_blank", "width=1200,height=800");

  if (!reportWindow) {
    window.alert("Popup blocked. Please allow popups to generate PDF.");
    return;
  }

  const summaryHtml = renderKeyValueList(summary || [], 4);
  const filtersHtml = renderKeyValueList(filters || [], 3);
  const highlightsHtml = renderKeyValueList(highlights || [], 2);

  const tableHead = headers
    .map(
      (header) =>
        `<th style="text-align:left;border:1px solid #d6dae3;padding:10px 12px;background:#f8fafc;color:#344054;">${escapeHtml(header.label)}</th>`
    )
    .join("");

  const tableRows = rows
    .map(
      (row, index) =>
        `<tr>${headers
          .map(
            (header) =>
              `<td style="border:1px solid #eaecf0;padding:10px 12px;background:${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">${escapeHtml(
                row[header.key]
              )}</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  const sectionsHtml = (sections || [])
    .map(
      (section) => `
        <section style="margin-top:28px;page-break-inside:avoid;">
          <div style="display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:12px;">
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;color:#101828;">${escapeHtml(section.title)}</h3>
              ${
                section.description
                  ? `<p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#667085;">${escapeHtml(section.description)}</p>`
                  : ""
              }
            </div>
          </div>
          ${renderSectionTable(section)}
        </section>
      `,
    )
    .join("");

  reportWindow.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          @page {
            size: A4;
            margin: 18mm 14mm;
          }

          body {
            font-family: Arial, sans-serif;
            color: #101828;
            margin: 0;
            background: #f5f7fb;
          }

          .report-shell {
            max-width: 1120px;
            margin: 0 auto;
            padding: 24px;
          }

          .report-card {
            background: #ffffff;
            border: 1px solid #d6dae3;
            border-radius: 22px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(16, 24, 40, 0.06);
          }

          .muted {
            color: #667085;
          }

          @media print {
            body {
              background: #ffffff;
            }

            .report-shell {
              padding: 0;
              max-width: none;
            }

            .report-card {
              border: none;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-shell">
          <div class="report-card">
            <div style="padding:28px 30px 22px;background:linear-gradient(135deg, #0f172a 0%, #111827 58%, #1f2937 100%);color:#ffffff;">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
                <div style="display:flex;align-items:center;gap:16px;">
                  <div style="height:58px;width:58px;border-radius:18px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;padding:8px;">
                    <img src="${getBrandLogoUrl()}" alt="PlayRizon" style="height:42px;width:42px;object-fit:contain;" />
                  </div>
                  <div>
                    <div style="font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;opacity:0.72;">
                      ${escapeHtml(reportLabel)}
                    </div>
                    <h1 style="margin:8px 0 0;font-size:30px;line-height:1.15;font-weight:700;">
                      ${escapeHtml(title)}
                    </h1>
                    <p style="margin:10px 0 0;font-size:13px;line-height:1.7;max-width:720px;opacity:0.82;">
                      ${escapeHtml(subtitle || "")}
                    </p>
                  </div>
                </div>
                <div style="min-width:180px;text-align:right;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;opacity:0.68;">
                    Generated
                  </div>
                  <div style="margin-top:8px;font-size:15px;font-weight:700;">
                    ${escapeHtml(new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }))}
                  </div>
                  <div style="margin-top:4px;font-size:12px;opacity:0.74;">
                    PlayRizon Reporting Suite
                  </div>
                </div>
              </div>
            </div>

            <div style="padding:24px 30px 30px;">
              <section style="page-break-inside:avoid;">
                <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#101828;">Executive Summary</h2>
                ${summaryHtml}
              </section>

              ${
                filters.length
                  ? `<section style="margin-top:24px;page-break-inside:avoid;">
                      <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#101828;">Filters Applied</h2>
                      ${filtersHtml}
                    </section>`
                  : ""
              }

              ${
                highlights.length
                  ? `<section style="margin-top:24px;page-break-inside:avoid;">
                      <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#101828;">Key Highlights</h2>
                      ${highlightsHtml}
                    </section>`
                  : ""
              }

              <section style="margin-top:28px;page-break-inside:avoid;">
                <div style="display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:12px;">
                  <div>
                    <h2 style="margin:0;font-size:18px;font-weight:700;color:#101828;">Detailed Report Data</h2>
                    <p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#667085;">
                      Structured booking and revenue detail for the selected report window.
                    </p>
                  </div>
                </div>
                <div style="overflow:hidden;border:1px solid #d6dae3;border-radius:16px;">
                  <table style="border-collapse: collapse; width: 100%; font-size: 12px;">
                    <thead><tr>${tableHead}</tr></thead>
                    <tbody>${tableRows}</tbody>
                  </table>
                </div>
              </section>

              ${sectionsHtml}

              <div style="margin-top:28px;padding-top:18px;border-top:1px solid #eaecf0;font-size:11px;line-height:1.7;color:#667085;display:flex;justify-content:space-between;gap:24px;">
                <div>
                  This report was generated by PlayRizon and is intended for internal operational use.
                </div>
                <div style="white-space:nowrap;">www.PlayRizon.com</div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
};
