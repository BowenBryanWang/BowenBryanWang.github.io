// The official icon of an application named in Figure 2. The files are in
// public/blog/agents-last-gym/apps, each taken from the project's own
// repository or website (sources and terms: see CREDITS.md next to this
// file). They are the projects' own artwork and trademarks, shown unmodified
// to identify the software. An application with no icon here gets a small
// monogram.

const DIR = '/blog/agents-last-gym/apps'

/** Application name as written in the figure -> icon file. */
const ICON: Record<string, string> = {
  Blender: 'blender.svg',
  FreeCAD: 'freecad.svg',
  'FreeCAD Path': 'freecad.svg',
  'FreeCAD BIM': 'freecad.svg',
  KiCad: 'kicad.svg',
  QGIS: 'qgis.svg',
  CloudCompare: 'cloudcompare.svg',
  LibreCAD: 'librecad.svg',
  QCAD: 'qcad.svg',
  PrusaSlicer: 'prusaslicer.svg',
  'Sweet Home 3D': 'sweethome3d.png',
  Shotcut: 'shotcut.svg',
  Godot: 'godot.svg',
  MuseScore: 'musescore.svg',
  Scribus: 'scribus.svg',
  Inkscape: 'inkscape.svg',
  'draw.io': 'drawio.svg',
  darktable: 'darktable.svg',
  ParaView: 'paraview.svg',
  JupyterLab: 'jupyter.svg',
  '3D Slicer': 'slicer.svg',
  napari: 'napari.svg',
  PyMOL: 'pymol.svg',
  PsychoPy: 'psychopy.svg',
  FSLeyes: 'fsleyes.png',
  'Chrome DevTools': 'chrome.svg',
  'VS Code': 'vscode.svg',
  'DB Browser for SQLite': 'sqlitebrowser.svg',
  DBeaver: 'dbeaver.png',
  Wireshark: 'wireshark.png',
  LibreOffice: 'libreoffice.svg',
  'LibreOffice Calc': 'libreoffice.svg',
}

/** An application, as its icon alone; the name is the tooltip and the
 *  accessible label. */
export default function AppChip({ name }: { name: string }) {
  const file = ICON[name]
  return (
    <span className="alg-app" title={name}>
      {file ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${DIR}/${file}`} alt={name} loading="lazy" decoding="async" />
      ) : (
        <span className="alg-app-mono" role="img" aria-label={name}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  )
}
