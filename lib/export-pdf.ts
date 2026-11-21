import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FicheAPC } from './types';
import { formatHandicapSummary } from './inclusion';
import { getEffectiveManipulationSchematisation } from './manipulation-phases';
import { slugifyFilename, svgToPngDataUrl } from './export-utils';

/**
 * Normalise les caractères Unicode typographiques hors WinAnsiEncoding
 * pour un rendu PDF propre avec les polices standard de jsPDF.
 */
function normalizePdfText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u0153/g, 'oe')
    .replace(/\u0152/g, 'OE')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2192|\u21D2/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u2194/g, '<->')
    .replace(/\u2264/g, '<=')
    .replace(/\u2265/g, '>=')
    .replace(/\u2260/g, '!=')
    .replace(/\u2248/g, '~')
    .replace(/\u221A/g, 'racine')
    .replace(/[\u2713\u2714]/g, '[OK]')
    .replace(/[\u2717\u2718]/g, '[X]')
    .replace(/\u2022/g, '-')
    .replace(/\u00A0/g, ' ');
}

async function renderFicheIntoPdf(
  doc: jsPDF,
  fiche: FicheAPC,
  kickerLabel = 'FICHE PEDAGOGIQUE APC - ACTIVITES PEDAGOGIQUES COMPLEMENTAIRES'
): Promise<void> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  const ensureSpace = (needed: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  // Kicker
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text(normalizePdfText(kickerLabel), margin, y);
  y += 6;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(normalizePdfText(fiche.titre), contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 2;

  // Theme
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const themeLines = doc.splitTextToSize(
    normalizePdfText(`Thème : ${fiche.theme}`),
    contentWidth
  );
  doc.text(themeLines, margin, y);
  y += themeLines.length * 5 + 4;

  // Metadata Table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    body: [
      [
        normalizePdfText(`Matière : ${fiche.matiere}`),
        normalizePdfText(`Niveau : ${fiche.niveau}`),
      ],
      [
        normalizePdfText(`Durée : ${fiche.duree}`),
        normalizePdfText(`Effectif : ${fiche.effectif}`),
      ],
      ...(fiche.competenceDeBase
        ? [
            [
              {
                content: normalizePdfText(
                  `CB (Compétence de Base) : ${fiche.competenceDeBase}`
                ),
                colSpan: 2,
              },
            ],
          ]
        : []),
      ...(fiche.handicapsInclus && fiche.handicapsInclus.length > 0
        ? [
            [
              {
                content: normalizePdfText(
                  `Inclusion handicap : ${formatHandicapSummary(fiche.handicapsInclus)}${fiche.origineModele ? ` (${fiche.origineModele})` : ''}`
                ),
                colSpan: 2,
              },
            ],
          ]
        : []),
      [
        {
          content: normalizePdfText(`Compétence visée : ${fiche.competenceVisee}`),
          colSpan: 2,
        },
      ],
    ],
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;

  // Objectives & Intro
  ensureSpace(34);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Objectifs, prérequis et mise en situation', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const introBlocks = [
    `Objectifs : ${(fiche.objectifsSpecifiques || []).filter(Boolean).join(' · ')}`,
    (fiche.prerequis || []).length > 0
      ? `Prérequis : ${(fiche.prerequis || []).filter(Boolean).join(' · ')}`
      : '',
    `Matériel : ${(fiche.materiel || []).filter(Boolean).join(' · ')}`,
    fiche.introduction?.accroche ? `Accroche : ${fiche.introduction.accroche}` : '',
    fiche.introduction?.miseEnSituation
      ? `Mise en situation : ${fiche.introduction.miseEnSituation}`
      : '',
    fiche.introduction?.consigneDepart
      ? `Consigne de départ : ${fiche.introduction.consigneDepart}`
      : '',
  ].filter(Boolean);

  for (const block of introBlocks) {
    const lines = doc.splitTextToSize(normalizePdfText(block), contentWidth);
    ensureSpace(lines.length * 4.5 + 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 1.5;
  }

  y += 3;

  // 4-Column Progression Table
  ensureSpace(26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Déroulement pédagogique structuré', margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      [
        'Étapes',
        'Activités du maître',
        'Activités des élèves',
        'Indicateurs pédagogiques inclusifs',
      ],
    ],
    body: (fiche.deroulement || []).map((step) => [
      normalizePdfText(
        `${step.etape}${step.sousTitreInvariable ? `\n[${step.sousTitreInvariable}]` : ''}\n(${step.duree})`
      ),
      normalizePdfText(step.activitesMaitre),
      normalizePdfText(step.activitesEleves),
      normalizePdfText(step.indicateursInclusifs),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.3,
      cellPadding: 3,
      overflow: 'linebreak',
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
      valign: 'top',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { cellWidth: 50 },
    },
    rowPageBreak: 'avoid',
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  const activeManip = getEffectiveManipulationSchematisation(fiche);
  if (activeManip && activeManip.phases.length > 0) {
    const isMath = Boolean(fiche.schematisationMath?.actif);
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(
      normalizePdfText(
        isMath
          ? `2b. Schématisation, exercices progressifs & Q&R (Mathématiques - ${activeManip.cbCode})`
          : `2b. Schématisation, exercices progressifs & Q&R (${fiche.matiere})`
      ),
      margin,
      y
    );
    y += 5;

    for (const phase of activeManip.phases) {
      ensureSpace(64);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(2, 132, 199);
      doc.text(
        normalizePdfText(`${phase.titrePhase} (${phase.modalite})`),
        margin,
        y
      );
      y += 4;

      const phasePng = await svgToPngDataUrl(phase.svgSchemaCode, 720, 400);
      if (phasePng) {
        const phaseImgW = 104;
        const phaseImgH = Math.round((phaseImgW * 200) / 360);
        ensureSpace(phaseImgH + 6);
        doc.addImage(phasePng, 'PNG', margin, y, phaseImgW, phaseImgH);
        y += phaseImgH + 3;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const phaseLines: string[] = [
        `Données concrètes : ${phase.donneesConcretes}`,
        `Matériel concret : ${phase.materielConcret}`,
        `Action & schématisation : ${phase.actionSchemaEleve}`,
        `Étayage inclusif APC : ${phase.etayageInclusifAPC}`,
      ];

      for (const ex of phase.exercicesProgressifs || []) {
        const rep = `${ex.reponseAttendue}${
          ex.unite &&
          !ex.reponseAttendue.toLowerCase().includes(ex.unite.toLowerCase())
            ? ` ${ex.unite}`
            : ''
        }`;
        phaseLines.push(
          `${ex.palier} : ${ex.consigne}${
            ex.choix && ex.choix.length > 0 ? ` [Choix : ${ex.choix.join(' / ')}]` : ''
          } -> Réponse : ${rep}${ex.explication ? ` (${ex.explication})` : ''}`
        );
      }

      (phase.questionsReponsesPhase || []).forEach((qr, qIdx) => {
        phaseLines.push(
          `Q${qIdx + 1} : ${qr.question} -> R${qIdx + 1} : ${qr.reponseAttendue}${
            qr.indice ? ` (Indice : ${qr.indice})` : ''
          }`
        );
      });

      for (const line of phaseLines) {
        const split = doc.splitTextToSize(normalizePdfText(line), contentWidth);
        ensureSpace(split.length * 4 + 1.5);
        doc.text(split, margin, y);
        y += split.length * 4 + 1;
      }
      y += 3;
    }

    if (activeManip.synthesePassageAbstraction) {
      const absLines = doc.splitTextToSize(
        normalizePdfText(
          `Passage à l'abstraction : ${activeManip.synthesePassageAbstraction}`
        ),
        contentWidth
      );
      ensureSpace(absLines.length * 4 + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(absLines, margin, y);
      y += absLines.length * 4 + 5;
    }
  }

  // Embedded Diagram PNG
  const pngDataUrl = await svgToPngDataUrl(fiche.illustration?.svgCode || '', 1280, 560);
  if (pngDataUrl) {
    ensureSpace(88);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(
      normalizePdfText(`3. Illustration : ${fiche.illustration?.titre || 'Schéma'}`),
      margin,
      y
    );
    y += 4;

    const imgWidth = contentWidth;
    const imgHeight = Math.round((imgWidth * 280) / 640);
    doc.addImage(pngDataUrl, 'PNG', margin, y, imgWidth, imgHeight);
    y += imgHeight + 4;

    if (fiche.illustration?.legende) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const legLines = doc.splitTextToSize(
        normalizePdfText(fiche.illustration.legende),
        contentWidth
      );
      doc.text(legLines, margin, y);
      y += legLines.length * 4 + 3;
    }

    if ((fiche.illustration?.annotations || []).length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      (fiche.illustration?.annotations || []).forEach((ann, i) => {
        const annLines = doc.splitTextToSize(
          normalizePdfText(`Repère ${i + 1} (${ann.label}) : ${ann.detail}`),
          contentWidth
        );
        ensureSpace(annLines.length * 4 + 2);
        doc.text(annLines, margin, y);
        y += annLines.length * 4 + 1.5;
      });
      y += 3;
    }
  }

  // Q&A Table
  if ((fiche.questionsReponses || []).length > 0) {
    ensureSpace(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. Questions-réponses interactives', margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Niveau', 'Question', 'Réponse attendue & Indice']],
      body: (fiche.questionsReponses || []).map((qr) => [
        normalizePdfText(qr.difficulte),
        normalizePdfText(qr.question),
        normalizePdfText(`${qr.reponseAttendue}\nIndice : ${qr.indicePedagogique}`),
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [2, 132, 199],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      styles: {
        font: 'helvetica',
        fontSize: 8.3,
        cellPadding: 3,
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 66 },
        2: { cellWidth: 86 },
      },
      rowPageBreak: 'avoid',
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // Synthesis
  ensureSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Synthèse et trace écrite', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const synthBlocks = [
    `Idée clé : ${fiche.synthese?.resumeCle || ''}`,
    `Trace écrite élève : ${fiche.synthese?.traceEcriteEleve || ''}`,
    `Mots-clés : ${(fiche.synthese?.motsCles || []).join(' · ')}`,
    `Prolongement : ${fiche.synthese?.prolongement || ''}`,
    ...(fiche.observations?.trim()
      ? [`Observations de la séance : ${fiche.observations}`]
      : []),
  ];
  for (const b of synthBlocks) {
    const lines = doc.splitTextToSize(normalizePdfText(b), contentWidth);
    ensureSpace(lines.length * 4.5 + 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 2;
  }

  if ((fiche.eleves || []).length > 0) {
    ensureSpace(30);
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('6. Suivi individualisé des élèves', margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Élève', 'Besoin / Adaptation', 'Objectif individualisé', 'Validation']],
      body: (fiche.eleves || []).map((el, idx) => [
        normalizePdfText(el.prenom || `Élève ${idx + 1}`),
        normalizePdfText(el.besoinSpecifique || '—'),
        normalizePdfText(el.objectifIndividuel || '—'),
        normalizePdfText(
          el.statut === 'acquis'
            ? 'Acquis'
            : el.statut === 'a_consolider'
            ? 'À consolider'
            : 'En cours'
        ),
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      styles: {
        font: 'helvetica',
        fontSize: 8.3,
        cellPadding: 3,
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: 'bold' },
        1: { cellWidth: 56 },
        2: { cellWidth: 64 },
        3: { cellWidth: 30, fontStyle: 'bold' },
      },
      rowPageBreak: 'avoid',
    });
  }
}

export async function exportFicheToPdf(fiche: FicheAPC): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  await renderFicheIntoPdf(doc, fiche);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      normalizePdfText(`Atelier APC · ${fiche.matiere} (${fiche.niveau})`),
      margin,
      doc.internal.pageSize.getHeight() - 9
    );
    doc.text(
      `Page ${i} / ${totalPages}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 9,
      { align: 'right' }
    );
  }

  doc.save(`${slugifyFilename(fiche.titre)}.pdf`);
}

export async function exportCompilationToPdf(
  fiches: FicheAPC[],
  compilationTitle = 'Compilation de fiches pédagogiques APC'
): Promise<void> {
  if (!fiches || fiches.length === 0) {
    throw new Error('Aucune fiche sélectionnée pour la compilation PDF.');
  }
  if (fiches.length === 1) {
    await exportFicheToPdf(fiches[0]);
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(2, 132, 199);
  doc.text('RECUEIL & COMPILATION PEDAGOGIQUE APC', margin, y);
  y += 8;

  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(
    normalizePdfText(compilationTitle),
    contentWidth
  );
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 3;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    normalizePdfText(
      `${fiches.length} fiches APC inclusives · Exporte le ${new Date().toLocaleDateString('fr-FR')}`
    ),
    margin,
    y
  );
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['N°', 'Titre de la fiche', 'Matière', 'Niveau', 'Durée']],
    body: fiches.map((f, idx) => [
      `${idx + 1}`,
      normalizePdfText(f.titre),
      normalizePdfText(f.matiere),
      normalizePdfText(f.niveau),
      normalizePdfText(f.duree),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 12, fontStyle: 'bold' },
      1: { cellWidth: 82 },
      2: { cellWidth: 42 },
      3: { cellWidth: 24 },
      4: { cellWidth: 22 },
    },
  });

  for (let i = 0; i < fiches.length; i++) {
    doc.addPage();
    await renderFicheIntoPdf(
      doc,
      fiches[i],
      `FICHE ${i + 1} / ${fiches.length} - ${fiches[i].matiere.toUpperCase()} (${fiches[i].niveau})`
    );
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      normalizePdfText(`Atelier APC · ${compilationTitle}`),
      margin,
      doc.internal.pageSize.getHeight() - 9
    );
    doc.text(
      `Page ${i} / ${totalPages}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 9,
      { align: 'right' }
    );
  }

  doc.save(`${slugifyFilename(compilationTitle)}.pdf`);
}

