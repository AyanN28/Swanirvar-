from pathlib import Path
from html import escape

def make_html(snapshot, out: Path):
    d=snapshot['decision']; rows=[]
    for k,v in d['dimensions'].items(): rows.append(f"<tr><td>{k}</td><td>{escape(v['name'])}</td><td>{v['score'] if v['score'] is not None else '—'}</td><td>{escape(v['status'])}</td></tr>")
    pidx = snapshot.get('preliminary_decision') or {}
    h=f'''<!doctype html><html><head><meta charset="utf-8"><title>Swanirvar Report</title><style>body{{font-family:Arial;padding:32px;color:#17364b}}h1{{color:#083a59}}h2{{color:#0b5878}}table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #d9e2e7;padding:8px}}th{{background:#eef5f8}}.note{{background:#fff7e5;padding:12px;border:1px solid #e7d08d}}.conclusion{{background:#eef8f3;padding:14px;border:1px solid #b7d9ca}}</style></head><body><h1>Swanirvar — Gairkata Tea Shop</h1><h2>Current Evidence Conclusion</h2><div class="conclusion"><b>Partial evidence index: {pidx.get('partial_index','—')}/100</b><br><br>{escape(pidx.get('conclusion',''))}</div><p>Canonical 7D: <b>{d['canonical_7d_score'] if d['canonical_7d_score'] is not None else 'PENDING EVIDENCE'}</b></p><table><tr><th>Code</th><th>Dimension</th><th>Score</th><th>Status</th></tr>{''.join(rows)}</table><div class="note"><b>Decision rule:</b> deterministic 7D math is authoritative. AI/ML/DL are advisory and cannot modify the score. Missing or unverified local evidence remains missing.</div></body></html>'''
    out.write_text(h,encoding='utf-8'); return out

def make_pdf(html_path: Path, pdf_path: Path, snapshot):
    from reportlab.lib.pagesizes import A4
    pidx = snapshot.get('preliminary_decision') or {}
    from reportlab.pdfgen import canvas
    d=snapshot['decision']
    c=canvas.Canvas(str(pdf_path),pagesize=A4); w,h=A4; y=h-45
    c.setFont('Helvetica-Bold',16); c.drawString(40,y,'Swanirvar — Gairkata Tea Shop'); y-=25
    c.setFont('Helvetica',10); c.drawString(40,y,'Current evidence conclusion / partial index: '+str(pidx.get('partial_index','—'))+'/100'); y-=18
    c.drawString(40,y,'Canonical 7D: '+str(d['canonical_7d_score'] if d['canonical_7d_score'] is not None else 'PENDING EVIDENCE')); y-=25
    c.setFont('Helvetica',9)
    for line in str(pidx.get('conclusion','')).split('\n'):
        c.drawString(45,y,line[:115]); y-=14
    y-=8
    for k,v in d['dimensions'].items():
        c.drawString(45,y,f"{k}  {v['name']}: {v['score'] if v['score'] is not None else '—'} [{v['status']}]"); y-=17
        if y<55: c.showPage(); y=h-45
    c.setFont('Helvetica',8); c.drawString(40,35,'AI/ML/DL are advisory only; no fabricated local evidence is inserted.')
    c.save(); return pdf_path
