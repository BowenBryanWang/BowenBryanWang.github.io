import type { ReactNode } from 'react'

// One line icon per domain, drawn on a 24-unit grid with the text colour.
// Keys are the example ids in examples.ts.
const ICONS: Record<string, ReactNode> = {
  // a chip with pins
  eda: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  // a frame with a play mark
  'film-video': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
  // a cube
  dcc3d: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" />,
  // a cell and its nucleus
  'lifesci-med': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="10" cy="11" r="2.5" />
      <circle cx="15.5" cy="15.5" r="1" />
    </>
  ),
  // two beamed notes
  'music-audio': (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  // a map pin
  'aec-geo': (
    <>
      <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0113 0C18.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  // a curve on axes
  scicomp: <path d="M4 4v16h16M7 15c2.5 0 2.5-7 5-7s2.5 6 6 6" />,
  // a gear
  'mech-cad': (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </>
  ),
  // a game controller
  gamedev: (
    <>
      <rect x="2.5" y="7" width="19" height="10" rx="5" />
      <path d="M7.5 10.5v3M6 12h3" />
      <circle cx="15.3" cy="10.8" r="0.6" />
      <circle cx="17.6" cy="13.2" r="0.6" />
    </>
  ),
  // a camera
  'photo-raw': (
    <>
      <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  // a bar chart
  'finance-biz': <path d="M4 4v16h16M8 16v-4M12 16V8M16 16v-6" />,
  // a flask
  'chem-materials': (
    <path d="M9.5 3h5M10.5 3v6L5 18.5A1.6 1.6 0 006.4 21h11.2a1.6 1.6 0 001.4-2.5L13.5 9V3M7.6 15h8.8" />
  ),
  // a curve between two handles
  design2d: (
    <>
      <path d="M5.5 17.5c2-9 11-3 13-11" />
      <rect x="2.5" y="17.5" width="3" height="3" />
      <rect x="18.5" y="3.5" width="3" height="3" />
    </>
  ),
  // a set square
  'drafting-2d': <path d="M4 20V5l15 15zM8 16.5v-3.5l3.5 3.5z" />,
  // a house
  'interior-design': <path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5" />,
  // a shield with a check
  'netsec-forensics': (
    <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.300-1.5-7.5-4.900-7.5-9.5V6zM9 12l2.200 2.200L15 10.500" />
  ),
  // a database
  'db-admin': (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v12c0 1.700 3.400 3 7.500 3s7.500-1.300 7.500-3V6M4.500 12c0 1.700 3.400 3 7.500 3s7.500-1.300 7.500-3" />
    </>
  ),
  // a page
  office: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />,
  // code brackets
  'visual-swe': <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.500 5l-3 14" />,
  // a cutting tool over a workpiece
  'cnc-cam': <path d="M12 3v8M9 11h6l-3 6zM4 21h16M7 21v-2.500h10V21" />,
  // stacked layers
  'additive-mfg': <path d="M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4" />,
  // a brain-wave trace
  'neuro-psych': <path d="M3 12h4l2-6 4 12 2-6h6" />,
  // a robot head
  'robot-use': (
    <>
      <rect x="5" y="8" width="14" height="11" rx="2.5" />
      <path d="M12 8V4.500M2.500 12.500v3M21.500 12.500v3" />
      <circle cx="12" cy="3.500" r="1" />
      <circle cx="9.500" cy="13.500" r="1" />
      <circle cx="14.500" cy="13.500" r="1" />
    </>
  ),
}

export default function DomainIcon({ id }: { id: string }) {
  return (
    <svg
      className="alg-chip-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[id] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}
