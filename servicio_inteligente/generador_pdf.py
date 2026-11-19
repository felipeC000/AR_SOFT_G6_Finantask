"""
Generación del comprobante o reporte de pagos en PDF.

Recibe un JSON con los datos (cliente, obligación y pagos) y devuelve el PDF ya armado. El backend PHP lo
pide por POST /generar-pdf y se lo entrega al navegador para descargarlo. Es un soporte informativo de los
pagos registrados en FinanTask: no es una factura electrónica ni tiene validez tributaria.
"""
from datetime import datetime
from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

AZUL = colors.HexColor("#2a5db0")
GRIS = colors.HexColor("#e8e8e8")


def moneda(valor: float) -> str:
    """1250000.5 -> $ 1.250.000,50 (formato colombiano)."""
    texto = f"{valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return "$ " + texto


def fecha_legible(texto: str) -> str:
    try:
        return datetime.strptime(texto, "%Y-%m-%d").strftime("%d/%m/%Y")
    except ValueError:
        return texto


def construir_pdf(d: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm,
                            topMargin=2 * cm, bottomMargin=2 * cm, title=d["titulo"], author="FinanTask")
    estilos = getSampleStyleSheet()
    celda = ParagraphStyle("celda", parent=estilos["Normal"], fontSize=9, leading=11)
    nota = ParagraphStyle("nota", parent=estilos["Normal"], fontSize=8, textColor=colors.grey, leading=10)
    marca = ParagraphStyle("marca", parent=estilos["Title"], textColor=AZUL, alignment=0, fontSize=22, spaceAfter=0)

    def txt(valor, negrita=False):
        t = escape(str(valor))
        return Paragraph(f"<b>{t}</b>" if negrita else t, celda)

    def cuadro(filas, anchos, columnas_titulo):
        t = Table([[txt(c, i in columnas_titulo) for i, c in enumerate(f)] for f in filas], colWidths=anchos)
        estilo = [("GRID", (0, 0), (-1, -1), 0.5, colors.grey), ("VALIGN", (0, 0), (-1, -1), "MIDDLE")]
        for i in columnas_titulo:
            estilo.append(("BACKGROUND", (i, 0), (i, -1), colors.whitesmoke))
        t.setStyle(TableStyle(estilo))
        return t

    elementos = [Paragraph("FinanTask", marca), Paragraph(escape(d["titulo"]), estilos["Heading2"]), Spacer(1, 6)]
    elementos.append(cuadro([
        ["Documento N°", d["numero"], "Fecha de emisión", fecha_legible(d["emitido"])],
        ["Cliente", d["usuario_nombre"], "Correo", d["usuario_correo"]],
    ], [3.2 * cm, 5.3 * cm, 3.2 * cm, 5.3 * cm], (0, 2)))

    o = d.get("obligacion")
    if o:
        elementos += [Spacer(1, 12), Paragraph("Obligación", estilos["Heading3"])]
        elementos.append(cuadro([
            ["Nombre", o.get("nombre", ""), "Categoría", o.get("categoria", "")],
            ["Valor", moneda(float(o.get("valor", 0))), "Fecha límite", fecha_legible(o.get("fecha_limite", ""))],
            ["Estado", o.get("estado", "").capitalize(), "Descripción", o.get("descripcion", "") or "-"],
        ], [3.2 * cm, 5.3 * cm, 3.2 * cm, 5.3 * cm], (0, 2)))

    elementos += [Spacer(1, 12), Paragraph("Pagos realizados", estilos["Heading3"])]
    if o:
        encabezado, anchos = ["N°", "Fecha de pago", "Valor pagado"], [1.5 * cm, 7 * cm, 8.5 * cm]
        filas = [[str(i), fecha_legible(p["fecha"]), moneda(p["valor"])] for i, p in enumerate(d["pagos"], 1)]
    else:
        encabezado, anchos = ["N°", "Fecha", "Obligación", "Categoría", "Valor pagado"], [1.2 * cm, 2.6 * cm, 5.4 * cm, 3.6 * cm, 4.2 * cm]
        filas = [[str(i), fecha_legible(p["fecha"]), p["obligacion"], p["categoria"], moneda(p["valor"])] for i, p in enumerate(d["pagos"], 1)]
    total = sum(p["valor"] for p in d["pagos"])
    datos = [[txt(c, True) for c in encabezado]] + [[txt(c) for c in f] for f in filas]
    datos.append([txt("")] * (len(encabezado) - 2) + [txt("Total pagado", True), txt(moneda(total), True)])
    tabla = Table(datos, colWidths=anchos, repeatRows=1)
    tabla.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey), ("BACKGROUND", (0, 0), (-1, 0), GRIS),
        ("BACKGROUND", (0, -1), (-1, -1), colors.whitesmoke), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elementos += [tabla, Spacer(1, 16), Paragraph(
        "Documento generado por FinanTask como soporte de los pagos registrados en el sistema. "
        "No es una factura electrónica ni tiene validez tributaria.", nota)]

    doc.build(elementos)
    return buffer.getvalue()
