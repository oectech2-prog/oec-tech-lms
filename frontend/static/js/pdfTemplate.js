// Shared PDF Template for all admission form downloads
function generateOecPdf(title, studentId, profilePicUrl, sections) {
  const w = window.open('', '_blank', 'width=800,height=1100');
  w.document.write(`<!DOCTYPE html><html><head><title>${title} - ${studentId}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;padding:0;color:#222;font-size:12px;position:relative;min-height:100vh}
    .page{padding:30px 40px 80px 40px}
    .pdf-header{text-align:center;border-bottom:3px solid #D4AF37;padding-bottom:15px;margin-bottom:20px;background:#050505;color:#fff;padding:20px 30px;margin:-30px -40px 20px -40px}
    .pdf-header .logo{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px}
    .pdf-header .logo svg{width:40px;height:40px}
    .pdf-header h1{font-size:20px;color:#D4AF37;letter-spacing:2px;margin-bottom:2px}
    .pdf-header .subtitle{font-size:10px;color:#A1A1AA;letter-spacing:1px;text-transform:uppercase}
    .pdf-header .form-title{font-size:14px;color:#fff;margin-top:8px;font-weight:bold}
    .pdf-header .id-badge{display:inline-block;background:#D4AF37;color:#050505;font-weight:bold;padding:5px 15px;border-radius:4px;font-size:13px;margin-top:8px;font-family:monospace}
    .section{margin-bottom:18px}
    .section h3{font-size:12px;color:#D4AF37;border-bottom:2px solid #D4AF37;padding-bottom:4px;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}
    .field{margin-bottom:6px}
    .field label{font-weight:bold;color:#888;font-size:9px;text-transform:uppercase;letter-spacing:0.5px}
    .field span{display:block;font-size:12px;color:#222;padding:3px 0;border-bottom:1px dotted #ddd}
    .photo{float:right;width:90px;height:110px;border:2px solid #D4AF37;border-radius:6px;object-fit:cover;margin-left:15px}
    .doc-img{max-width:200px;max-height:150px;border:1px solid #ddd;border-radius:4px;margin:4px 0;object-fit:contain}
    .doc-link{color:#D4AF37;text-decoration:none;font-size:11px}
    .pdf-footer{position:fixed;bottom:0;left:0;right:0;background:#050505;color:#A1A1AA;padding:12px 40px;display:flex;justify-content:space-between;align-items:center;font-size:9px;border-top:2px solid #D4AF37}
    .pdf-footer .left{display:flex;gap:15px}
    .pdf-footer .right{color:#D4AF37;font-weight:bold}
    @media print{body{padding:0}.pdf-footer{position:fixed;bottom:0}.no-print{display:none!important}}
  </style></head><body>
  <div class="page">
    <div class="pdf-header">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="40" height="40" rx="8" fill="#0A0A0A" stroke="none"/><g transform="translate(6,8)"><path d="M14 2L1 8.5L14 15L27 8.5L14 2Z" fill="#D4AF37" fill-opacity="0.2"/><path d="M5 11.5v6c0 0 3 3.5 9 3.5s9-3.5 9-3.5v-6"/><path d="M25 8.5v8"/></g></svg>
        <div><h1>OEC TECH INSTITUTE</h1><div class="subtitle">CHUNIAN</div></div>
      </div>
      <div class="form-title">${title}</div>
      ${studentId ? `<div class="id-badge">${studentId}</div>` : ''}
    </div>
    ${profilePicUrl ? `<img src="${profilePicUrl}" class="photo" onerror="this.style.display='none'">` : ''}
    ${sections}
    <div class="no-print" style="text-align:center;margin-top:30px">
      <button onclick="window.print()" style="background:#D4AF37;color:#050505;border:none;padding:12px 40px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:14px;letter-spacing:1px">Print / Save as PDF</button>
    </div>
  </div>
  <div class="pdf-footer">
    <div class="left"><span>info@oectechs.com</span><span>0300-0517616</span><span>www.oectechs.com</span></div>
    <div class="right">Founder/CEO : Sadam Zargar</div>
  </div>
  </body></html>`);
  w.document.close();
}

function pdfField(label, value) {
  return `<div class="field"><label>${label}</label><span>${value || '-'}</span></div>`;
}

function pdfDocSection(docs) {
  if (!docs || docs.length === 0) return '';
  const items = docs.filter(d => d.url).map(d => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(d.url) || d.url.includes('/uploads/');
    return `<div style="margin-bottom:8px"><label style="font-weight:bold;color:#888;font-size:9px;text-transform:uppercase">${d.label}</label><br>
      ${isImage ? `<img src="${d.url}" class="doc-img" onerror="this.outerHTML='<a href=\\'${d.url}\\' class=\\'doc-link\\'>View Document</a>'">` : `<a href="${d.url}" class="doc-link" target="_blank">View / Download Document</a>`}
    </div>`;
  });
  if (items.length === 0) return '';
  return `<div class="section"><h3>Uploaded Documents</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${items.join('')}</div></div>`;
}
