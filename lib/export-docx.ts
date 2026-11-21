import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { FicheAPC } from './types';
import { formatHandicapSummary } from './inclusion';
import { getEffectiveManipulationSchematisation } from './manipulation-phases';
import {
  dataUrlToUint8Array,
  slugifyFilename,
  svgToPngDataUrl,
  triggerBlobDownload,
} from './export-utils';

const BORDER_COLOR = 'CBD5E1';
const DARK_SLATE = '0F172A';
const ACCENT_BLUE = '0284C7';
const LIGHT_BG = 'F8FAFC';

function cellBorders(color = BORDER_COLOR) {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color },
    bottom: { style: BorderStyle.SINGLE, size: 4, color },
    left: { style: BorderStyle.SINGLE, size: 4, color },
    right: { style: BorderStyle.SINGLE, size: 4, color },
  };
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: DARK_SLATE,
        font: 'Calibri',
      }),
    ],
  });
}

function labeledParagraph(label: string, value: string): Paragraph {
  const lines = (value || '—').split(/\r?\n/);
  const children: TextRun[] = [
    new TextRun({
      text: `${label} : `,
      bold: true,
      size: 21,
      color: DARK_SLATE,
      font: 'Calibri',
    }),
  ];
  lines.forEach((line, i) => {
    if (i > 0) {
      children.push(new TextRun({ break: 1, text: '' }));
    }
    children.push(
      new TextRun({
        text: line || ' ',
        size: 21,
        color: '334155',
        font: 'Calibri',
      })
    );
  });
  return new Paragraph({
    spacing: { after: 100 },
    children,
  });
}

function multilineCellParagraphs(text: string): Paragraph[] {
  const raw = text && text.trim() ? text : '—';
  const lines = raw.split(/\r?\n/);
  return lines.map(
    (line, idx) =>
      new Paragraph({
        spacing: { after: idx < lines.length - 1 ? 60 : 0 },
        children: [
          new TextRun({
            text: line || ' ',
            size: 19,
            color: '1E293B',
            font: 'Calibri',
          }),
        ],
      })
  );
}

async function buildFicheDocxChildren(
  fiche: FicheAPC,
  options?: { pageBreakBefore?: boolean; indexLabel?: string }
): Promise<(Paragraph | Table)[]> {
  const pngDataUrl = await svgToPngDataUrl(fiche.illustration?.svgCode || '', 1200, 520);

  const metaRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: LIGHT_BG },
          borders: cellBorders(),
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [labeledParagraph('Matière', fiche.matiere)],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: LIGHT_BG },
          borders: cellBorders(),
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [labeledParagraph('Niveau scolaire', fiche.niveau)],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: cellBorders(),
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [labeledParagraph('Durée', fiche.duree)],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: cellBorders(),
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [labeledParagraph('Effectif / Groupe', fiche.effectif)],
        }),
      ],
    }),
    ...(fiche.competenceDeBase
      ? [
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: LIGHT_BG },
                borders: cellBorders(),
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                  labeledParagraph(
                    'CB (Compétence de Base)',
                    fiche.competenceDeBase
                  ),
                ],
              }),
            ],
          }),
        ]
      : []),
    ...(fiche.handicapsInclus && fiche.handicapsInclus.length > 0
      ? [
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'ECFDF5' },
                borders: cellBorders(),
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                  labeledParagraph(
                    'Inclusion handicap',
                    `${formatHandicapSummary(fiche.handicapsInclus)}${fiche.origineModele ? ` (${fiche.origineModele})` : ''}`
                  ),
                ],
              }),
            ],
          }),
        ]
      : []),
    ...(fiche.fichierSource || fiche.derniereRetouche
      ? [
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: LIGHT_BG },
                borders: cellBorders(),
                margins: { top: 90, bottom: 90, left: 140, right: 140 },
                children: [
                  labeledParagraph(
                    'Traçabilité Fiche / Fichier',
                    [
                      fiche.fichierSource
                        ? `Fichier source (${fiche.fichierSource.action === 'retouche' ? 'retouche' : 'création'}) : ${fiche.fichierSource.nom} [${fiche.fichierSource.format.toUpperCase()}]`
                        : '',
                      fiche.derniereRetouche
                        ? `Dernière retouche : ${fiche.derniereRetouche.sectionsModifiees.join(', ')}`
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  ),
                ],
              }),
            ],
          }),
        ]
      : []),
  ];

  const deroulementHeader = new TableRow({
    tableHeader: true,
    children: [
      { label: 'Étapes', width: 18 },
      { label: 'Activités du maître', width: 28 },
      { label: 'Activités des élèves', width: 27 },
      { label: 'Indicateurs pédagogiques inclusifs', width: 27 },
    ].map(
      (col) =>
        new TableCell({
          width: { size: col.width, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: DARK_SLATE },
          borders: cellBorders(DARK_SLATE),
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: col.label,
                  bold: true,
                  size: 20,
                  color: 'FFFFFF',
                  font: 'Calibri',
                }),
              ],
            }),
          ],
        })
    ),
  });

  const deroulementRows = (fiche.deroulement || []).map(
    (step, idx) =>
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            shading:
              idx % 2 === 1
                ? { type: ShadingType.SOLID, color: LIGHT_BG }
                : undefined,
            borders: cellBorders(),
            margins: { top: 100, bottom: 100, left: 110, right: 110 },
            children: [
              new Paragraph({
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: step.etape,
                    bold: true,
                    size: 20,
                    color: DARK_SLATE,
                    font: 'Calibri',
                  }),
                ],
              }),
              ...(step.sousTitreInvariable
                ? [
                    new Paragraph({
                      spacing: { after: 40 },
                      children: [
                        new TextRun({
                          text: step.sousTitreInvariable,
                          italics: true,
                          size: 17,
                          color: '475569',
                          font: 'Calibri',
                        }),
                      ],
                    }),
                  ]
                : []),
              new Paragraph({
                children: [
                  new TextRun({
                    text: step.duree,
                    size: 18,
                    color: ACCENT_BLUE,
                    bold: true,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
          ...[
            step.activitesMaitre,
            step.activitesEleves,
            step.indicateursInclusifs,
          ].map(
            (text, colIdx) =>
              new TableCell({
                width: { size: colIdx === 0 ? 28 : 27, type: WidthType.PERCENTAGE },
                shading:
                  idx % 2 === 1
                    ? { type: ShadingType.SOLID, color: LIGHT_BG }
                    : undefined,
                borders: cellBorders(),
                margins: { top: 100, bottom: 100, left: 110, right: 110 },
                children: multilineCellParagraphs(text),
              })
          ),
        ],
      })
  );

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      pageBreakBefore: Boolean(options?.pageBreakBefore),
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: options?.indexLabel
            ? `${options.indexLabel} · FICHE PÉDAGOGIQUE APC`
            : 'FICHE PÉDAGOGIQUE APC — ACTIVITÉS PÉDAGOGIQUES COMPLÉMENTAIRES',
          bold: true,
          size: 18,
          color: ACCENT_BLUE,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: fiche.titre,
          bold: true,
          size: 34,
          color: DARK_SLATE,
          font: 'Georgia',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Thème : ${fiche.theme}`,
          italics: true,
          size: 22,
          color: '475569',
          font: 'Calibri',
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: metaRows,
    }),
    sectionTitle('1. Cadre pédagogique et objectifs'),
    labeledParagraph('Compétence visée', fiche.competenceVisee),
    ...(fiche.objectifsSpecifiques || []).map(
      (obj) =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: obj,
              size: 20,
              color: '1E293B',
              font: 'Calibri',
            }),
          ],
        })
    ),
    labeledParagraph('Prérequis', (fiche.prerequis || []).join(' · ')),
    labeledParagraph('Matériel & ressources', (fiche.materiel || []).join(' · ')),
    sectionTitle('2. Introduction et mise en situation'),
    labeledParagraph('Accroche', fiche.introduction?.accroche || ''),
    labeledParagraph('Mise en situation', fiche.introduction?.miseEnSituation || ''),
    labeledParagraph('Consigne de départ', fiche.introduction?.consigneDepart || ''),
    sectionTitle('3. Déroulement pédagogique structuré'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [deroulementHeader, ...deroulementRows],
    }),
  ];

  const activeManip = getEffectiveManipulationSchematisation(fiche);
  if (activeManip && activeManip.phases.length > 0) {
    const isMath = Boolean(fiche.schematisationMath?.actif);
    children.push(
      sectionTitle(
        isMath
          ? `3b. Schématisation, exercices progressifs & Q&R par phases (Mathématiques — ${activeManip.cbCode})`
          : `3b. Schématisation, exercices progressifs & Q&R par phases (${fiche.matiere})`
      ),
      ...(isMath && activeManip.cbLibelle
        ? [labeledParagraph('Compétence de Base', activeManip.cbLibelle)]
        : []),
      labeledParagraph(
        'Situation-problème source',
        activeManip.situationProblemeReference
      )
    );

    for (const phase of activeManip.phases) {
      children.push(
        new Paragraph({
          spacing: { before: 140, after: 40 },
          children: [
            new TextRun({
              text: `${phase.titrePhase} (${phase.modalite})`,
              bold: true,
              size: 21,
              color: ACCENT_BLUE,
              font: 'Calibri',
            }),
          ],
        })
      );

      const phasePng = await svgToPngDataUrl(phase.svgSchemaCode, 720, 400);
      if (phasePng) {
        const phaseBytes = dataUrlToUint8Array(phasePng);
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 80 },
            children: [
              new ImageRun({
                type: 'png',
                data: phaseBytes,
                transformation: {
                  width: 440,
                  height: 244,
                },
              }),
            ],
          })
        );
      }

      children.push(
        labeledParagraph('Données concrètes', phase.donneesConcretes),
        labeledParagraph('Matériel concret', phase.materielConcret),
        labeledParagraph('Manipulation & schématisation', phase.actionSchemaEleve),
        labeledParagraph('Étayage inclusif APC', phase.etayageInclusifAPC)
      );

      if ((phase.exercicesProgressifs || []).length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: `Exercices progressifs — ${phase.titrePhase}`,
                bold: true,
                size: 20,
                color: DARK_SLATE,
                font: 'Calibri',
              }),
            ],
          })
        );
        for (const ex of phase.exercicesProgressifs || []) {
          const repText = `${ex.reponseAttendue}${
            ex.unite &&
            !ex.reponseAttendue.toLowerCase().includes(ex.unite.toLowerCase())
              ? ` ${ex.unite}`
              : ''
          }`;
          children.push(
            labeledParagraph(ex.palier, `${ex.consigne}${ex.donneesConcretes ? ` [${ex.donneesConcretes}]` : ''}`),
            ...(ex.choix && ex.choix.length > 0
              ? [labeledParagraph('Choix proposés', ex.choix.join(' / '))]
              : []),
            labeledParagraph(
              'Réponse & explication',
              `${repText}${ex.explication ? ` — ${ex.explication}` : ''}`
            )
          );
        }
      }

      if ((phase.questionsReponsesPhase || []).length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: `Questions–Réponses de la phase (Thème · Titre · Situation)`,
                bold: true,
                size: 20,
                color: DARK_SLATE,
                font: 'Calibri',
              }),
            ],
          })
        );
        (phase.questionsReponsesPhase || []).forEach((qr, qIdx) => {
          children.push(
            labeledParagraph(`Q${qIdx + 1}`, qr.question),
            labeledParagraph(
              `R${qIdx + 1}`,
              `${qr.reponseAttendue}${qr.indice ? ` (Indice : ${qr.indice})` : ''}`
            )
          );
        });
      }
    }

    if (activeManip.synthesePassageAbstraction) {
      children.push(
        labeledParagraph(
          'Passage à l’abstraction',
          activeManip.synthesePassageAbstraction
        )
      );
    }
  }

  if (pngDataUrl) {
    const imgBytes = dataUrlToUint8Array(pngDataUrl);
    children.push(
      sectionTitle(`4. Illustration & Schéma annoté : ${fiche.illustration?.titre || 'Schéma'}`),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
        children: [
          new ImageRun({
            type: 'png',
            data: imgBytes,
            transformation: {
              width: 560,
              height: 245,
            },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: fiche.illustration?.legende || '',
            italics: true,
            size: 19,
            color: '475569',
            font: 'Calibri',
          }),
        ],
      })
    );

    if ((fiche.illustration?.annotations || []).length > 0) {
      (fiche.illustration?.annotations || []).forEach((ann, i) => {
        children.push(
          labeledParagraph(`Repère ${i + 1} (${ann.label})`, ann.detail)
        );
      });
    }
  }

  if ((fiche.questionsReponses || []).length > 0) {
    children.push(sectionTitle('5. Questions-réponses interactives'));
    (fiche.questionsReponses || []).forEach((qr, i) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: `Q${i + 1} [${qr.difficulte}] : ${qr.question}`,
              bold: true,
              size: 20,
              color: DARK_SLATE,
              font: 'Calibri',
            }),
          ],
        }),
        labeledParagraph('Réponse attendue', qr.reponseAttendue),
        labeledParagraph('Étayage / Indice', qr.indicePedagogique)
      );
    });
  }

  children.push(
    sectionTitle('6. Synthèse et trace écrite'),
    labeledParagraph('Idée clé à retenir', fiche.synthese?.resumeCle || ''),
    labeledParagraph('Trace écrite de l’élève', fiche.synthese?.traceEcriteEleve || ''),
    labeledParagraph('Mots-clés', (fiche.synthese?.motsCles || []).join(' · ')),
    labeledParagraph('Prolongement', fiche.synthese?.prolongement || '')
  );

  if (fiche.observations?.trim()) {
    children.push(
      labeledParagraph('Observations de l’enseignant', fiche.observations)
    );
  }

  if ((fiche.eleves || []).length > 0) {
    const elevesHeader = new TableRow({
      tableHeader: true,
      children: [
        { label: 'Élève', width: 20 },
        { label: 'Besoin / Adaptation', width: 32 },
        { label: 'Objectif individualisé', width: 32 },
        { label: 'Validation', width: 16 },
      ].map(
        (col) =>
          new TableCell({
            width: { size: col.width, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: DARK_SLATE },
            borders: cellBorders(DARK_SLATE),
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: col.label,
                    bold: true,
                    size: 19,
                    color: 'FFFFFF',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          })
      ),
    });

    const elevesRows = (fiche.eleves || []).map(
      (el, idx) =>
        new TableRow({
          cantSplit: true,
          children: [
            el.prenom || `Élève ${idx + 1}`,
            el.besoinSpecifique || '—',
            el.objectifIndividuel || '—',
            el.statut === 'acquis'
              ? 'Acquis'
              : el.statut === 'a_consolider'
              ? 'À consolider'
              : 'En cours',
          ].map(
            (val, colIdx) =>
              new TableCell({
                width: {
                  size: colIdx === 0 ? 20 : colIdx === 3 ? 16 : 32,
                  type: WidthType.PERCENTAGE,
                },
                shading:
                  idx % 2 === 1
                    ? { type: ShadingType.SOLID, color: LIGHT_BG }
                    : undefined,
                borders: cellBorders(),
                margins: { top: 90, bottom: 90, left: 100, right: 100 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: val,
                        bold: colIdx === 0 || colIdx === 3,
                        size: 19,
                        color: '1E293B',
                        font: 'Calibri',
                      }),
                    ],
                  }),
                ],
              })
          ),
        })
    );

    children.push(
      sectionTitle('7. Suivi individualisé des élèves'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [elevesHeader, ...elevesRows],
      })
    );
  }

  return children;
}

export async function exportFicheToDocx(fiche: FicheAPC): Promise<void> {
  const children = await buildFicheDocxChildren(fiche);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              right: 900,
              bottom: 900,
              left: 900,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${fiche.matiere} · ${fiche.niveau} · ${fiche.titre}`,
                    size: 17,
                    color: '64748B',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Atelier APC — Fiche pédagogique prête à l’impression · Page ',
                    size: 17,
                    color: '64748B',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 17,
                    color: '64748B',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerBlobDownload(blob, `${slugifyFilename(fiche.titre)}.docx`);
}

export async function exportCompilationToDocx(
  fiches: FicheAPC[],
  compilationTitle = 'Compilation de fiches pédagogiques APC'
): Promise<void> {
  if (!fiches || fiches.length === 0) {
    throw new Error('Aucune fiche sélectionnée pour la compilation Word.');
  }
  if (fiches.length === 1) {
    await exportFicheToDocx(fiches[0]);
    return;
  }

  const tocHeader = new TableRow({
    tableHeader: true,
    children: [
      { label: 'N°', width: 8 },
      { label: 'Titre de la fiche', width: 42 },
      { label: 'Matière', width: 22 },
      { label: 'Niveau', width: 14 },
      { label: 'Durée', width: 14 },
    ].map(
      (col) =>
        new TableCell({
          width: { size: col.width, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: DARK_SLATE },
          borders: cellBorders(DARK_SLATE),
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: col.label,
                  bold: true,
                  size: 19,
                  color: 'FFFFFF',
                  font: 'Calibri',
                }),
              ],
            }),
          ],
        })
    ),
  });

  const tocRows = fiches.map(
    (f, idx) =>
      new TableRow({
        cantSplit: true,
        children: [
          `${idx + 1}`,
          f.titre,
          f.matiere,
          f.niveau,
          f.duree,
        ].map(
          (val, colIdx) =>
            new TableCell({
              width: {
                size: colIdx === 0 ? 8 : colIdx === 1 ? 42 : colIdx === 2 ? 22 : 14,
                type: WidthType.PERCENTAGE,
              },
              shading:
                idx % 2 === 1
                  ? { type: ShadingType.SOLID, color: LIGHT_BG }
                  : undefined,
              borders: cellBorders(),
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: val,
                      bold: colIdx === 0 || colIdx === 1,
                      size: 19,
                      color: '1E293B',
                      font: 'Calibri',
                    }),
                  ],
                }),
              ],
            })
        ),
      })
  );

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: 'RECUEIL & COMPILATION PÉDAGOGIQUE APC',
          bold: true,
          size: 20,
          color: ACCENT_BLUE,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: compilationTitle,
          bold: true,
          size: 38,
          color: DARK_SLATE,
          font: 'Georgia',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 220 },
      children: [
        new TextRun({
          text: `${fiches.length} fiches structurées avec adaptations inclusives, schématisations et Q&R · Généré le ${new Date().toLocaleDateString('fr-FR')}`,
          italics: true,
          size: 21,
          color: '475569',
          font: 'Calibri',
        }),
      ],
    }),
    sectionTitle('Sommaire des fiches compilées'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [tocHeader, ...tocRows],
    }),
  ];

  for (let i = 0; i < fiches.length; i++) {
    const ficheChildren = await buildFicheDocxChildren(fiches[i], {
      pageBreakBefore: true,
      indexLabel: `FICHE ${i + 1} / ${fiches.length}`,
    });
    children.push(...ficheChildren);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              right: 900,
              bottom: 900,
              left: 900,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${compilationTitle} (${fiches.length} fiches)`,
                    size: 17,
                    color: '64748B',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Atelier APC — Recueil pédagogique imprimable · Page ',
                    size: 17,
                    color: '64748B',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 17,
                    color: '64748B',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerBlobDownload(blob, `${slugifyFilename(compilationTitle)}.docx`);
}

