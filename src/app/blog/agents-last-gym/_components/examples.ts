// Example tasks shown in the ring at the top of the post. Titles and
// descriptions come from the task records in the paper repo
// (assets/task-examples); internal provenance fields are left out.

export interface Example {
  id: string
  domain: string
  /** Short domain name shown above the front card. */
  label: string
  app: string
  title: string
  /** Shorter title for the card, where the task title does not fit one line. */
  cardTitle?: string
  description: string
  /** One line for the card, at most about 65 characters. */
  short: string
  status: string
  image: string
  w: number
  h: number
}

export const EXAMPLES: Example[] = [
  {
    "id": "eda",
    "domain": "Electronic design",
    "app": "KiCad",
    "title": "Restore Board Signal Routing",
    "description": "Restore the specified signal traces on an editable KiCad board while preserving component placement and existing copper outside the work region.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/eda.webp",
    "w": 1280,
    "h": 686,
    "short": "Restore the missing signal traces on an open-hardware KiCad board.",
    "label": "Electronic Design"
  },
  {
    "id": "film-video",
    "domain": "Film and video",
    "app": "Shotcut",
    "title": "Cut a Dialogue Scene",
    "description": "Trim a locked Shotcut scene to 32 seconds while retaining complete dialogue lines and synchronized picture and sound.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/film-video.webp",
    "w": 1270,
    "h": 688,
    "short": "Cut a locked Shotcut scene to 32 seconds without breaking a line.",
    "label": "Film & Video"
  },
  {
    "id": "dcc3d",
    "domain": "3D content creation",
    "app": "Blender",
    "title": "Repair Hard Surface Shading",
    "description": "Repair the imported television’s normals and edge shading in Blender while preserving its existing mesh topology.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/dcc3d.webp",
    "w": 1280,
    "h": 720,
    "short": "Fix the normals and edge shading of an imported model in Blender.",
    "label": "3D Content"
  },
  {
    "id": "lifesci-med",
    "domain": "Life-science imaging",
    "app": "napari",
    "title": "Nuclei Segmentation Proofreading",
    "description": "Correct merged, split, missing, and spurious nuclei in a fluorescence microscopy field and save an integer label TIFF for per-nucleus measurement.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/lifesci-med.webp",
    "w": 1280,
    "h": 686,
    "short": "Correct merged, split and missing nuclei in a microscopy field.",
    "cardTitle": "Proofread Nuclei Segmentation",
    "label": "Life Sciences"
  },
  {
    "id": "music-audio",
    "domain": "Music and audio",
    "app": "MuseScore",
    "title": "Proofread a Recognized Score",
    "description": "Correct the MuseScore draft of Chaminade’s Ritournelle against nine printed pages while preserving notation that already matches.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/music-audio.webp",
    "w": 1280,
    "h": 686,
    "short": "Proofread a MuseScore draft against nine printed pages of a score.",
    "label": "Music"
  },
  {
    "id": "aec-geo",
    "domain": "AEC and geospatial",
    "app": "QGIS",
    "title": "Repair Cadastral Parcel Topology",
    "description": "Fix invalid parcel boundaries in a QGIS cadastral section while preserving the supplied parcel identities, attributes, and coordinate system.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/aec-geo.webp",
    "w": 1280,
    "h": 720,
    "short": "Fix invalid parcel boundaries in a QGIS cadastral section.",
    "cardTitle": "Repair Parcel Topology",
    "label": "AEC & Geospatial"
  },
  {
    "id": "scicomp",
    "domain": "Scientific computing",
    "app": "ParaView",
    "title": "Rebuild a Simulation View",
    "description": "Recreate a ParaView comparison of hot air jets from the supplied simulation fields while preserving the editable visualization pipeline.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/scicomp.webp",
    "w": 1280,
    "h": 720,
    "short": "Recreate a ParaView comparison of hot air jets from simulation data.",
    "label": "Scientific Computing"
  },
  {
    "id": "mech-cad",
    "domain": "Mechanical CAD",
    "app": "FreeCAD",
    "title": "Complete a Manufacturing Drawing",
    "description": "Finish an editable FreeCAD manufacturing drawing for a released linear bearing, including the required views and dimensions.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/mech-cad.webp",
    "w": 1280,
    "h": 720,
    "short": "Finish the FreeCAD manufacturing drawing of a linear bearing.",
    "cardTitle": "Complete a Part Drawing",
    "label": "Mechanical CAD"
  },
  {
    "id": "gamedev",
    "domain": "Game development",
    "app": "Godot",
    "title": "Restore a Godot Room",
    "description": "Restore the damaged foreground tilemap and collision surfaces in Godot’s Relic Room using the finished-level reference.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/gamedev.webp",
    "w": 1280,
    "h": 720,
    "short": "Restore a damaged tilemap and its collisions in a Godot level.",
    "label": "Game Development"
  },
  {
    "id": "photo-raw",
    "domain": "RAW photo editing",
    "app": "darktable",
    "title": "Prepare a Color Chart",
    "description": "Balance and crop a photographed color chart in darktable, then export a calibrated reproduction with the specified metadata.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/photo-raw.webp",
    "w": 1280,
    "h": 720,
    "short": "Balance, crop and export a photographed color chart in darktable.",
    "label": "Photography"
  },
  {
    "id": "finance-biz",
    "domain": "Finance and business",
    "app": "LibreOffice Calc",
    "title": "Integrated Financial Forecast",
    "description": "Build a three-year operating model in LibreOffice Calc by linking the income statement, balance sheet, and cash-flow forecast to UPS’s annual filing and testing that the balance sheet balances each year.",
    "status": "published",
    "image": "/blog/agents-last-gym/examples/finance-biz.webp",
    "w": 1280,
    "h": 720,
    "short": "Build a linked three-statement forecast from UPS’s annual filing.",
    "label": "Finance"
  },
  {
    "id": "chem-materials",
    "domain": "Chemistry and materials",
    "app": "PyMOL",
    "title": "Repair Crystal Deposition Model",
    "description": "Inspect a photophysical material’s crystal structure, correct its misassigned atomic sites, and prepare the CIF for deposition.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/chem-materials.webp",
    "w": 1280,
    "h": 720,
    "short": "Correct misassigned atomic sites and prepare a CIF for deposition.",
    "cardTitle": "Repair a Crystal Structure",
    "label": "Chemistry & Materials"
  },
  {
    "id": "design2d",
    "domain": "2D design",
    "app": "Inkscape",
    "title": "Revise a Vector Illustration",
    "description": "Revise an existing Inkscape diagram to match the approved print proof while preserving the editable vector artwork.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/design2d.webp",
    "w": 1280,
    "h": 686,
    "short": "Revise an Inkscape diagram to match the approved print proof.",
    "label": "2D Design"
  },
  {
    "id": "drafting-2d",
    "domain": "Engineering drafting",
    "app": "LibreCAD",
    "title": "Draft a Flange Gasket",
    "description": "Draw a new gasket cutting profile in LibreCAD while preserving the supplied flange geometry and following the annotated engineering brief.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/drafting-2d.webp",
    "w": 1280,
    "h": 720,
    "short": "Draw a gasket cutting profile in LibreCAD from an annotated brief.",
    "label": "Drafting"
  },
  {
    "id": "interior-design",
    "domain": "Interior design",
    "app": "Sweet Home 3D",
    "title": "Retrofit an Accessible Bathroom",
    "description": "Retrofit the surveyed bathroom in Sweet Home 3D with a roll-in shower and accessible fixture clearances.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/interior-design.webp",
    "w": 1280,
    "h": 720,
    "short": "Retrofit a surveyed bathroom with a roll-in shower in Sweet Home 3D.",
    "cardTitle": "Accessible Bathroom Retrofit",
    "label": "Interior Design"
  },
  {
    "id": "netsec-forensics",
    "domain": "Network forensics",
    "app": "Wireshark",
    "title": "VoIP Call Reconstruction",
    "description": "Trace SIP registrations and RTP streams in a Wireshark capture to explain which calls connected and where signalling failed.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/netsec-forensics.webp",
    "w": 1280,
    "h": 720,
    "short": "Trace SIP and RTP in a Wireshark capture to explain failed calls.",
    "label": "Network Forensics"
  },
  {
    "id": "db-admin",
    "domain": "Database administration",
    "app": "DB Browser for SQLite",
    "title": "Relational Schema Migration",
    "description": "Migrate a legacy database in DB Browser for SQLite by transforming existing values and retaining keys, dependencies, triggers, and indexes.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/db-admin.webp",
    "w": 1280,
    "h": 720,
    "short": "Migrate a legacy SQLite schema, keeping keys, triggers and indexes.",
    "label": "Databases"
  },
  {
    "id": "office",
    "domain": "Office productivity",
    "app": "LibreOffice Writer",
    "title": "Contract Document Structure",
    "description": "Restore the heading hierarchy, generated table of contents, and internal cross-references in a government contract template using LibreOffice Writer.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/office.webp",
    "w": 1280,
    "h": 720,
    "short": "Restore headings, contents and cross-references in a contract.",
    "label": "Office"
  },
  {
    "id": "visual-swe",
    "domain": "Visual software engineering",
    "app": "Hugo",
    "title": "Responsive Keyboard Accessibility",
    "description": "Repair keyboard focus for copy controls in a Hugo theme while preserving content and layout at desktop, tablet, and phone widths.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/visual-swe.webp",
    "w": 1280,
    "h": 720,
    "short": "Repair keyboard focus in a Hugo theme at three screen widths.",
    "cardTitle": "Repair Keyboard Accessibility",
    "label": "Visual SWE"
  },
  {
    "id": "robot-use",
    "domain": "Robot use",
    "app": "Robot simulator",
    "title": "Sort Tagged Workbench Parts",
    "description": "Use camera feedback to place two tagged parts in their inspection trays while leaving the yellow gauge undisturbed.",
    "status": "preview",
    "image": "/blog/agents-last-gym/examples/robot-use.webp",
    "w": 640,
    "h": 480,
    "short": "Place two tagged parts in their trays using camera feedback.",
    "label": "Robot-Use Agents"
  }
]
