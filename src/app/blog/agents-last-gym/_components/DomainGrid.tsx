import type React from 'react'

import AppChip from './AppChip'
import { SHOTS } from './shots'

// Figure 2: every domain of Agents' Last Gym as a tile in an irregular grid
// of mixed sizes, two levels deep: a domain's tile holds its representative
// task templates as smaller blocks, and each of those holds a picture. A tile shows a screenshot at its own proportions, the domain,
// the marks of the software its tasks run in, and its representative task
// templates as small blocks nested inside the tile.
//
// Source: the project's template registry, snapshot of 17 Nov 2026 (active
// templates only), plus the task examples of 18 Nov for the three domains
// added since. `templates` are plain-English renderings of the registry ids
// given in the comments; a tile shows as many of them as it has room for. The grouping into families only sets the order.

interface Row {
  id: string // icon key in DomainIcon
  name: string
  note?: string
  /** A few words on the templates listed below it; not shown in the figure. */
  summary: string
  templates: string[]
  software: string
}
interface Family {
  name: string
  rows: Row[]
}

const FAMILIES: Family[] = [
  {
    name: 'Engineering and manufacturing',
    rows: [
      {
        id: 'mech-cad',
        summary: 'Change orders, lightweighting, drawings',
        name: 'Mechanical CAD',
        // cad-eco-hole-pattern-change-execution, cad-mass-reduction-to-target,
        // part-to-dimensioned-drawing
        templates: [
          'Engineering change on a released part',
          'Lightweighting to a mass target',
          'Manufacturing drawing from a part',
        ],
        software: 'FreeCAD',
      },
      {
        id: 'eda',
        summary: 'Subsystems, routing, rule repair',
        name: 'Electronic design',
        // eda-subsystem-from-spec, board-differential-pair-routing,
        // board-drc-violation-repair
        templates: [
          'Differential-pair routing',
          'Subsystem from a requirements spec',
          'Design-rule violation repair',
        ],
        software: 'KiCad, ngspice',
      },
      {
        id: 'aec-geo',
        summary: 'Model changes, parcels, take-offs',
        name: 'AEC and geospatial',
        // aec-ifc-design-change-propagation, geo-cadastre-parcel-division,
        // aec-quantity-takeoff-from-model
        templates: [
          'Design change through a building model',
          'Cadastral parcel division',
          'Quantity take-off from a model',
        ],
        software: 'QGIS, FreeCAD BIM, CloudCompare',
      },
      {
        id: 'drafting-2d',
        summary: 'Redlines, flat patterns, floor plans',
        name: 'Engineering drafting',
        // redline-revision-incorporation, sheet-metal-flat-pattern,
        // survey-to-floor-plan
        templates: [
          'Redline revision of a released drawing',
          'Sheet-metal flat pattern',
          'Floor plan from a measured survey',
        ],
        software: 'LibreCAD, QCAD',
      },
      {
        id: 'cnc-cam',
        summary: 'Two-setup parts, prove-outs, retargets',
        name: 'CNC programming',
        // two-op-flip-cover, cam-program-proveout-repair,
        // material-machine-retarget
        templates: [
          'Two-setup part from one drawing',
          'Program prove-out and repair',
          'Job retargeted to another machine',
        ],
        software: 'FreeCAD Path',
      },
      {
        id: 'additive-mfg',
        summary: 'Printer profiles, materials, part splits',
        name: 'Additive manufacturing',
        // am-klipper-printer-commissioning, am-tds-material-bringup,
        // am-oversize-split
        templates: [
          'Printer commissioning profile',
          'Material bring-up from a datasheet',
          'Oversize part split for a small printer',
        ],
        software: 'PrusaSlicer',
      },
      {
        id: 'interior-design',
        summary: 'Fit-outs, retrofits, kitchens',
        name: 'Interior design',
        // interior-plan-to-build, accessible-bathroom-retrofit,
        // kitchen-layout-guidelines
        templates: [
          'Fit-out from an architect’s plan sheets',
          'Accessible bathroom retrofit',
          'Kitchen layout to guidelines',
        ],
        software: 'Sweet Home 3D',
      },
    ],
  },
  {
    name: 'Media and creative',
    rows: [
      {
        id: 'dcc3d',
        summary: 'Assets, retopology, shot layout',
        name: '3D content',
        // blender-asset-from-reference-model-and-shade,
        // blender-retopo-to-deforming-target, blender-shot-layout-from-storyboard
        templates: [
          'Asset modelled and shaded from a reference',
          'Retopology for a deforming character',
          'Shot layout from a storyboard',
        ],
        software: 'Blender',
      },
      {
        id: 'film-video',
        summary: 'Director’s notes, conforms, sound sync',
        name: 'Film and video',
        // video-apply-director-notes, video-edl-conform,
        // video-dual-system-sound-sync
        templates: [
          'Director’s notes on a locked scene',
          'Conform from an edit decision list',
          'Dual-system sound sync',
        ],
        software: 'Shotcut',
      },
      {
        id: 'gamedev',
        summary: 'Bug fixes, levels, UI layouts',
        name: 'Game development',
        // game-runtime-bug-fix-from-report, game-tilemap-level-from-reference,
        // game-ui-layout-from-mockup
        templates: [
          'Runtime bug fixed from a report',
          'Level rebuilt from a reference',
          'UI layout from a mockup',
        ],
        software: 'Godot',
      },
      {
        id: 'music-audio',
        summary: 'Edition proofs, transcription, transposition',
        name: 'Music and audio',
        // music-edition-final-proof, audio-score-completion-by-ear,
        // music-transpose-and-reharmonize
        templates: [
          'Final proof of an edition',
          'Score completed by ear',
          'Transposition and reharmonization',
        ],
        software: 'MuseScore',
      },
      {
        id: 'design2d',
        summary: 'Page spreads, dielines, diagrams',
        name: '2D design',
        // scribus-manuscript-spread-build, svg-packaging-dieline-resize,
        // drawio-network-topology-from-lldp
        templates: [
          'Manuscript spreads from a production brief',
          'Packaging dieline resized',
          'Network topology from a neighbour export',
        ],
        software: 'Scribus, Inkscape, draw.io',
      },
      {
        id: 'photo-raw',
        summary: 'Product packs, grey matching, print prep',
        name: 'Photography',
        // raw-product-white-background-pack, raw-multicamera-grey-match,
        // raw-exhibition-print-frame
        templates: [
          'Product pack on a white background',
          'Grey match across cameras',
          'Exhibition print preparation',
        ],
        software: 'darktable',
      },
    ],
  },
  {
    name: 'Science and medicine',
    rows: [
      {
        id: 'scicomp',
        summary: 'Visualizations, figures, solver debugging',
        name: 'Scientific computing',
        // sci-paraview-visualization-match, sci-paper-figure-reproduction,
        // sci-solver-instability-debug
        templates: [
          'Published visualization rebuilt from raw data',
          'Paper figure reproduced from source data',
          'Unstable solver debugged',
        ],
        software: 'ParaView, JupyterLab',
      },
      {
        id: 'lifesci-med',
        summary: 'Pre-op packages, segmentation, proofreading',
        name: 'Life sciences and imaging',
        // med-la-preop-package, med-glioma-subregion-correction,
        // bio-microscopy-segmentation-correction
        templates: [
          'Tumour segmentation corrected',
          'Nuclei segmentation proofread',
          'Pre-operative left-atrium package',
        ],
        software: '3D Slicer, napari, PyMOL',
      },
      {
        id: 'chem-materials',
        summary: 'Crystal structure repair',
        name: 'Chemistry and materials',
        // chem-crystal-structure-deposition-repair
        templates: ['Crystal structure repaired for deposition'],
        software: 'PyMOL',
      },
      {
        id: 'neuro-psych',
        summary: 'In preparation',
        name: 'Neuroscience and psychology',
        templates: [],
        software: 'PsychoPy, FSLeyes',
      },
    ],
  },
  {
    name: 'Software and data',
    rows: [
      {
        id: 'visual-swe',
        summary: 'Visual regressions, accessibility',
        name: 'Visual SWE',
        // vswe-visual-regression-root-cause-fix, vswe-a11y-remediation
        templates: ['Visual regression traced to its cause', 'Keyboard accessibility remediation'],
        software: 'Chrome DevTools, VS Code',
      },
      {
        id: 'db-admin',
        summary: 'Migrations, key repair, search indexes',
        name: 'Databases',
        // schema-migration-v2, fk-orphan-repair-and-enforce,
        // fts5-search-index-sync
        templates: [
          'Schema migration on a live table',
          'Orphaned foreign keys repaired',
          'Search index built and kept in sync',
        ],
        software: 'DB Browser for SQLite, DBeaver',
      },
      {
        id: 'netsec-forensics',
        summary: 'Call reconstruction, decryption, audits',
        name: 'Network forensics',
        // voip-sip-call-reconstruction, tls-keylog-decryption-analysis,
        // ics-modbus-write-audit
        templates: [
          'VoIP call reconstruction',
          'TLS decryption from a key log',
          'Industrial control write audit',
        ],
        software: 'Wireshark',
      },
    ],
  },
  {
    name: 'Business',
    rows: [
      {
        id: 'finance-biz',
        summary: 'Projections, model audits, merger analysis',
        name: 'Finance',
        // sec-three-statement-projection, sec-dcf-model-audit-repair,
        // sec-merger-accretion-dilution
        templates: [
          'Three-statement projection from a filing',
          'Valuation model audit and repair',
          'Merger accretion and dilution',
        ],
        software: 'LibreOffice Calc',
      },
      {
        id: 'office',
        summary: 'Documents, decks, spreadsheets',
        name: 'Office',
        note: 'control set',
        // office-doc-engineering, office-impress-sector-briefing-deck,
        // office-calc-seasonal-adjustment
        templates: [
          'Long structured document rebuilt',
          'Briefing deck from an analysis',
          'Seasonal adjustment of a series',
        ],
        software: 'LibreOffice',
      },
    ],
  },
  {
    name: 'Embodied',
    rows: [
      {
        id: 'robot-use',
        summary: 'Workbench sorting',
        name: 'Robot-use agents',
        // robot-sim-task-via-tool-api
        templates: ['Tagged parts sorted on a workbench'],
        software: 'Robot simulator',
      },
    ],
  },
]

// Where each domain tile sits on the 12-column, 11-row grid of the wide
// layout: [first column, columns, first row, rows]. The tiles are
// deliberately of many sizes and do not line up into regular rows; together
// they cover the grid exactly.
const PLACE: Record<string, [number, number, number, number]> = {
  // rows 1-4
  eda: [1, 4, 1, 4],
  'film-video': [5, 4, 1, 2],
  scicomp: [9, 4, 1, 2],
  'mech-cad': [5, 3, 3, 2],
  'aec-geo': [8, 3, 3, 2],
  'drafting-2d': [11, 2, 3, 2],
  // rows 5-11, as five columns of tiles with the breaks at different rows
  gamedev: [1, 3, 5, 2],
  dcc3d: [1, 3, 7, 3],
  'music-audio': [1, 3, 10, 2],
  'db-admin': [4, 2, 5, 3],
  'cnc-cam': [4, 2, 8, 2],
  'additive-mfg': [4, 2, 10, 2],
  'interior-design': [6, 2, 5, 2],
  office: [6, 2, 7, 1],
  'chem-materials': [6, 2, 8, 2],
  'visual-swe': [6, 2, 10, 2],
  'lifesci-med': [8, 3, 5, 2],
  'neuro-psych': [8, 3, 7, 1],
  design2d: [8, 3, 8, 2],
  'photo-raw': [8, 3, 10, 2],
  'finance-biz': [11, 2, 5, 2],
  'netsec-forensics': [11, 2, 7, 3],
  'robot-use': [11, 2, 10, 2],
}

/**
 * How a tile arranges its template blocks, and how many it has room for,
 * from its size in cells:
 *   4x4 "lead"  one large block over two smaller ones
 *   3x3 "beside" one large block beside two stacked ones
 *   4x2 / 3x2 "row"  three / two blocks side by side
 *   2x3 "stack" two blocks, one above the other
 *   2x2 "one"   a single block
 *   one row "strip"  no template blocks
 */
function arrangement([, w, , h]: [number, number, number, number]): [string, number] {
  if (h === 1) return ['strip', 0]
  if (w === 4 && h === 4) return ['lead', 3]
  if (w === 3 && h === 3) return ['beside', 3]
  if (w === 2 && h === 3) return ['stack', 2]
  if (w === 2) return ['one', 1]
  return ['row', w === 4 ? 3 : 2]
}

// Each template block holds a picture: a real screenshot of the domain's
// software doing that kind of work, freely licensed and credited under the
// figure (shots.ts). They illustrate the kind of task; they are not our own
// tasks, and the figure does not reuse the task screenshots of the ring
// above. Listed per domain in the order of its templates; a block whose
// picture is not in shots.ts yet shows a plain panel.
const PICTURES: Record<string, string[]> = {
  eda: ['eda', 'eda-schematic', 'eda-drc'],
  'film-video': ['film-video', 'film-multitrack', 'film-filters'],
  scicomp: ['scicomp', 'sci-notebook-plot', 'sci-notebook-code'],
  'mech-cad': ['mech-cad', 'cad-fem'],
  'aec-geo': ['aec-bim', 'aec-geo'],
  'drafting-2d': ['drafting-2d'],
  gamedev: ['game-script', 'gamedev'],
  dcc3d: ['dcc3d', '3d-topology', '3d-animation'],
  'music-audio': ['music-audio', 'music-second'],
  'db-admin': ['db-schema', 'db-admin'],
  'cnc-cam': ['cnc-cam'],
  'additive-mfg': ['additive-mfg'],
  'interior-design': ['interior-design'],
  'chem-materials': ['chem-materials'],
  'visual-swe': ['visual-swe'],
  'lifesci-med': ['lifesci-med', 'life-napari'],
  design2d: ['design-scribus', 'design2d'],
  'photo-raw': ['photo-raw', 'photo-lighttable'],
  'finance-biz': ['finance-biz'],
  'netsec-forensics': ['net-voip-or-tls', 'netsec-forensics'],
  'robot-use': ['robot-use'],
}
const DIR = '/blog/agents-last-gym/domains'

const ROWS = FAMILIES.flatMap((f) => f.rows)

export default function DomainGrid() {
  return (
    <div className="alg-grid">
      {ROWS.map((d, i) => {
        const place = PLACE[d.id]
        const [c, w, r, h] = place
        const [kind, room] = arrangement(place)
        // The first `room` of the domain's representative templates, by name.
        const labels = d.templates.slice(0, room)
        return (
          <section
            key={d.id}
            className={`alg-tile alg-tile-${kind}`}
            style={
              {
                '--c': c,
                '--w': w,
                '--r': r,
                '--h': h,
                // A different soft tint per tile: hues a golden angle apart,
                // so neighbours in the list are far apart on the wheel.
                '--hue': Math.round((28 + i * 137.508) % 360),
              } as React.CSSProperties
            }
          >
            <div className="alg-tile-head">
              <h3>
                {d.name}
                {d.note ? <em> ({d.note})</em> : null}
              </h3>
              <div className="alg-tile-software">
                {d.software.split(', ').map((a) => (
                  <AppChip key={a} name={a} />
                ))}
              </div>
            </div>
            {/* The domain's representative templates: blocks nested inside
                the domain's block, each with its picture. */}
            {labels.length ? (
              <div className="alg-tpls" style={{ '--n': labels.length } as React.CSSProperties}>
                {labels.map((t, k) => {
                  const file = SHOTS[PICTURES[d.id]?.[k] ?? '']?.file
                  return (
                    <figure key={t} className="alg-tpl">
                      <div className={file ? 'alg-tpl-img' : 'alg-tpl-img alg-tpl-img-empty'}>
                        {file ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`${DIR}/${file}`} alt="" loading="lazy" decoding="async" />
                        ) : null}
                      </div>
                      <figcaption>{t}</figcaption>
                    </figure>
                  )
                })}
              </div>
            ) : null}
            {!d.templates.length ? <p className="alg-tile-pending">In preparation</p> : null}
          </section>
        )
      })}
    </div>
  )
}

/** Credits for the pictures the figure actually shows, in tile order. */
export function DomainGridCredits() {
  const used = ROWS.flatMap((d) => {
    const [, room] = arrangement(PLACE[d.id])
    return (PICTURES[d.id] ?? []).slice(0, room)
  }).filter((slug) => SHOTS[slug])
  return (
    <details className="alg-credits">
      <summary>Image credits</summary>
      <p>
        The pictures are screenshots of the software by their authors, freely licensed, shown
        resized. They illustrate the kind of task and are not tasks from the suite. Application
        icons are the projects’ own marks.
      </p>
      <ul>
        {used.map((slug) => (
          <li key={slug}>
            <a href={SHOTS[slug].url} target="_blank" rel="noreferrer">
              {SHOTS[slug].credit}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
