// Pictures used in Figure 2, with their credits. Generated from the manifests
// of the downloaded screenshots; every picture is freely licensed and shown
// resized, never cropped. `url` is the page the picture and its licence come
// from.

export interface Shot {
  file: string
  w: number
  h: number
  credit: string
  license: string
  url: string
}

export const SHOTS: Record<string, Shot> = {
  "mech-cad": {
    "file": "mech-cad.webp",
    "w": 640,
    "h": 394,
    "credit": "FreeCAD screenshot by Maxwxyz, CC BY 4.0, via Wikimedia Commons",
    "license": "CC BY 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:FreeCAD_26.3_Light_Assembly_Example.jpg"
  },
  "eda": {
    "file": "eda.webp",
    "w": 900,
    "h": 491,
    "credit": "KiCad PCB Editor screenshot by Jon Neal, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:KiCad_V6_PCB_Full_View.png"
  },
  "aec-geo": {
    "file": "aec-geo.webp",
    "w": 640,
    "h": 360,
    "credit": "QGIS screenshot by Wikideas1, CC0, via Wikimedia Commons (basemap © OpenStreetMap contributors)",
    "license": "CC0 1.0 (public domain dedication)",
    "url": "https://commons.wikimedia.org/wiki/File:QGIS_screenshot.webp"
  },
  "drafting-2d": {
    "file": "drafting-2d.webp",
    "w": 640,
    "h": 500,
    "credit": "QCad Community Edition screenshot by Tdc (software by RibbonSoft), CC BY-SA 3.0, via Wikimedia Commons",
    "license": "CC BY-SA 3.0 (also GFDL; software GPL)",
    "url": "https://commons.wikimedia.org/wiki/File:QCad_CE_2.0.4.png"
  },
  "cnc-cam": {
    "file": "cnc-cam.webp",
    "w": 640,
    "h": 359,
    "credit": "FreeCAD Path workbench screenshot by Sliptonic, CC BY 3.0, via the FreeCAD wiki",
    "license": "CC BY 3.0 (FreeCAD wiki site licence)",
    "url": "https://wiki.freecad.org/File:Pathwb.png"
  },
  "additive-mfg": {
    "file": "additive-mfg.webp",
    "w": 640,
    "h": 448,
    "credit": "PrusaSlicer screenshot by Majkluss, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:PrusaSlicer.png"
  },
  "interior-design": {
    "file": "interior-design.webp",
    "w": 640,
    "h": 480,
    "credit": "Sweet Home 3D screenshot by Emmanuel Puybaret, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:SweetHome3D-800x600-Windows-en.png"
  },
  "dcc3d": {
    "file": "dcc3d.webp",
    "w": 640,
    "h": 360,
    "credit": "Blender screenshot by UnnecessaryDecision, CC0, via Wikimedia Commons",
    "license": "CC0 1.0 (Blender UI itself GPL)",
    "url": "https://commons.wikimedia.org/wiki/File:Blender_4.3.2_screenshot.png"
  },
  "film-video": {
    "file": "film-video.webp",
    "w": 640,
    "h": 360,
    "credit": "Shotcut screenshot by Pavouk, CC0, via Wikimedia Commons",
    "license": "CC0 1.0",
    "url": "https://commons.wikimedia.org/wiki/File:Shotcut_printscreen_cs.png"
  },
  "gamedev": {
    "file": "gamedev.webp",
    "w": 640,
    "h": 342,
    "credit": "Godot Engine screenshot by Gflare, CC0, via Wikimedia Commons (scene: Godot TPS demo, assets by Juan Linietsky and Fernando Miguel Calabró, CC BY 3.0)",
    "license": "CC0 1.0 for the screenshot; Godot editor UI MIT (Expat)",
    "url": "https://commons.wikimedia.org/wiki/File:Godot_4.6.png"
  },
  "music-audio": {
    "file": "music-audio.webp",
    "w": 640,
    "h": 360,
    "credit": "MuseScore 4 screenshot (uploaded by Hstoops), CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:MuseScore_4_in_light_mode.png"
  },
  "design2d": {
    "file": "design2d.webp",
    "w": 640,
    "h": 342,
    "credit": "Inkscape 1.4 screenshot by VulcanSphere (GTK logo by Andreas Nilsson), CC BY-SA 3.0, via Wikimedia Commons",
    "license": "CC BY-SA 3.0 (also GFDL; software GPL)",
    "url": "https://commons.wikimedia.org/wiki/File:Inkscape_1.4_screenshot.webp"
  },
  "photo-raw": {
    "file": "photo-raw.webp",
    "w": 640,
    "h": 350,
    "credit": "darktable screenshot by สาริศ ธนาโสภณ (T.saris), CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:Darktable_4.4.2_with_an_image_opened_in_darkroom_view.png"
  },
  "scicomp": {
    "file": "scicomp.webp",
    "w": 640,
    "h": 344,
    "credit": "ParaView screenshot by Nicoguaro, CC BY 4.0, via Wikimedia Commons",
    "license": "CC BY 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:Paraview_5.0.png"
  },
  "lifesci-med": {
    "file": "lifesci-med.webp",
    "w": 640,
    "h": 554,
    "credit": "3D Slicer meningioma segmentation by Rkikinis, CC BY-SA 3.0, via Wikimedia Commons",
    "license": "CC BY-SA 3.0 (also GFDL)",
    "url": "https://commons.wikimedia.org/wiki/File:MeningiomaMRISegmentation.png"
  },
  "chem-materials": {
    "file": "chem-materials.webp",
    "w": 640,
    "h": 519,
    "credit": "PyMOL screenshot by Pjotr Morgen, CC BY-SA 3.0, via Wikimedia Commons",
    "license": "CC BY-SA 3.0 (also GFDL)",
    "url": "https://commons.wikimedia.org/wiki/File:PyMOL_large.png"
  },
  "neuro-psych": {
    "file": "neuro-psych.webp",
    "w": 640,
    "h": 406,
    "credit": "PsychoPy Builder, Fig. 1 of Peirce et al. (2019), 'PsychoPy2: Experiments in behavior made easy', Behavior Research Methods 51:195-203, CC BY 4.0",
    "license": "CC BY 4.0",
    "url": "https://doi.org/10.3758/s13428-018-01193-y"
  },
  "visual-swe": {
    "file": "visual-swe.webp",
    "w": 640,
    "h": 487,
    "credit": "Firefox Developer Tools screenshot by Mir Novov (Firefox © Mozilla, MPL 2.0; page shown: English Wikipedia, CC BY-SA 4.0), via Wikimedia Commons",
    "license": "MPL 2.0 (free-software screenshot); Wikimedia trademark notice",
    "url": "https://commons.wikimedia.org/wiki/File:Firefox_dev_tools.jpg"
  },
  "db-admin": {
    "file": "db-admin.webp",
    "w": 640,
    "h": 406,
    "credit": "DB Browser for SQLite screenshot by Tobias1984, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:Pywikibot_tutorial_-_db_browser_sqlite_-_table_view.png"
  },
  "netsec-forensics": {
    "file": "netsec-forensics.webp",
    "w": 640,
    "h": 470,
    "credit": "Wireshark screenshot by Drew Carver1, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:Wireshark_packets.png"
  },
  "finance-biz": {
    "file": "finance-biz.webp",
    "w": 640,
    "h": 338,
    "credit": "LibreOffice Calc screenshot by Itfc-commons (LibreOffice © The Document Foundation and contributors), MPL 2.0, via Wikimedia Commons",
    "license": "MPL 2.0",
    "url": "https://commons.wikimedia.org/wiki/File:LO_Calc_8_Graph_of_rainfall_with_data.png"
  },
  "office": {
    "file": "office.webp",
    "w": 640,
    "h": 360,
    "credit": "LibreOffice Writer screenshot by Hérisson grognon, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:LibreOffice_Writer_7.5.0_Windows10.png"
  },
  "robot-use": {
    "file": "robot-use.webp",
    "w": 640,
    "h": 405,
    "credit": "Gazebo (Ignition) screenshot by Open Robotics, CC BY 3.0, via Wikimedia Commons",
    "license": "CC BY 3.0",
    "url": "https://commons.wikimedia.org/wiki/File:Ignition_showcase_1.png"
  },
  "eda-schematic": {
    "file": "eda-schematic.webp",
    "w": 640,
    "h": 350,
    "credit": "KiCad Schematic Editor screenshot by Jon Neal, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:KiCad_V6_SCH.png"
  },
  "eda-drc": {
    "file": "eda-drc.webp",
    "w": 640,
    "h": 483,
    "credit": "KiCad Design Rules Checker screenshot from the KiCad documentation, © The KiCad Team, CC BY 3.0, docs.kicad.org",
    "license": "CC BY 3.0 or later, or GPL-3.0-or-later (KiCad documentation is dual licensed; s",
    "url": "https://docs.kicad.org/master/en/pcbnew/pcbnew.html#inspecting_a_board"
  },
  "film-filters": {
    "file": "film-filters.webp",
    "w": 640,
    "h": 348,
    "credit": "Kdenlive screenshot by Ddeepeshkumar, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:Kdenlive_20.04.1.png"
  },
  "film-multitrack": {
    "file": "film-multitrack.webp",
    "w": 640,
    "h": 363,
    "credit": "Shotcut screenshot by Maupao70, CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:Shotcut_screenshot.png"
  },
  "sci-notebook-plot": {
    "file": "sci-notebook-plot.webp",
    "w": 640,
    "h": 360,
    "credit": "JupyterLab documentation screenshot, © Project Jupyter Contributors, BSD 3-Clause License",
    "license": "BSD-3-Clause (JupyterLab repository LICENSE; image is the docs' auto-generated s",
    "url": "https://jupyterlab.readthedocs.io/en/latest/"
  },
  "sci-notebook-code": {
    "file": "sci-notebook-code.webp",
    "w": 640,
    "h": 360,
    "credit": "JupyterLab documentation screenshot, © Project Jupyter Contributors, BSD 3-Clause License (map tiles © OpenStreetMap contributors)",
    "license": "BSD-3-Clause (JupyterLab repository LICENSE)",
    "url": "https://jupyterlab.readthedocs.io/en/latest/user/notebook.html"
  },
  "cad-fem": {
    "file": "cad-fem.webp",
    "w": 640,
    "h": 394,
    "credit": "FreeCAD FEM workbench screenshot by Maxwxyz, CC BY 4.0, via Wikimedia Commons",
    "license": "CC BY 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:FreeCAD_26.3_Light_FEM_Example.jpg"
  },
  "aec-bim": {
    "file": "aec-bim.webp",
    "w": 640,
    "h": 394,
    "credit": "FreeCAD BIM workbench screenshot by Maxwxyz, CC BY 4.0, via Wikimedia Commons",
    "license": "CC BY 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:FreeCAD_26.3_Light_BIM_Example.jpg"
  },
  "game-script": {
    "file": "game-script.webp",
    "w": 640,
    "h": 360,
    "credit": "Godot Engine script editor screenshot by VicFic2006, MIT License, via Wikimedia Commons",
    "license": "MIT (Commons {{free screenshot|template=MIT}})",
    "url": "https://commons.wikimedia.org/wiki/File:Scripting_Workspace_in_Godot_Game_Engine.jpg"
  },
  "3d-topology": {
    "file": "3d-topology.webp",
    "w": 640,
    "h": 470,
    "credit": "Image from the Blender Manual, © Blender Documentation Team, CC BY-SA 4.0",
    "license": "CC BY-SA 4.0 (Blender Manual LICENSE)",
    "url": "https://docs.blender.org/manual/en/latest/sculpt_paint/sculpting/introduction/adaptive.html"
  },
  "3d-animation": {
    "file": "3d-animation.webp",
    "w": 640,
    "h": 409,
    "credit": "Blender screenshot with Grease Pencil animation by Andry Rasoahaingo (dedouze.com), CC BY-SA 3.0, via Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "url": "https://commons.wikimedia.org/wiki/File:Grease_pencil_rasoahaingo.png"
  },
  "music-second": {
    "file": "music-second.webp",
    "w": 640,
    "h": 396,
    "credit": "MuseScore 4 screenshot by Kreuzschnabel (software © Werner Schweer et al.), GNU GPL, via Wikimedia Commons",
    "license": "GNU GPL (Commons {{free screenshot|license={{GPL}}}} tag)",
    "url": "https://commons.wikimedia.org/wiki/File:Musescore-4-0-1-debian-kde.png"
  },
  "db-schema": {
    "file": "db-schema.webp",
    "w": 640,
    "h": 441,
    "credit": "DB Browser for SQLite screenshot from the project repository, © DB4S developers, MPL 2.0 / GPL v3+",
    "license": "MPL-2.0 or GPL-3.0-or-later (repository is bi-licensed; see LICENSE in sqlitebro",
    "url": "https://github.com/sqlitebrowser/sqlitebrowser/blob/master/images/sqlitebrowser.png"
  },
  "life-napari": {
    "file": "life-napari.webp",
    "w": 640,
    "h": 427,
    "credit": "napari screenshot from the napari documentation, © napari contributors, BSD 3-Clause License",
    "license": "BSD-3-Clause (napari/docs repository LICENSE)",
    "url": "https://napari.org/stable/howtos/layers/labels.html"
  },
  "design-scribus": {
    "file": "design-scribus.webp",
    "w": 640,
    "h": 360,
    "credit": "Scribus screenshot by Henrik \"HerHde\" Hüttemann, CC BY-SA 4.0, via Wikimedia Commons (photo in layout: Luc Viatour, CC BY-SA)",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:Scribus_1.4.6_on_Linux_Mint_18.png"
  },
  "net-voip-or-tls": {
    "file": "net-voip-or-tls.webp",
    "w": 640,
    "h": 347,
    "credit": "Wireshark Flow Graph screenshot from the Wireshark User's Guide, © Wireshark contributors, GNU GPL v2+",
    "license": "GNU GPL v2 or later (the User's Guide states 'this document is covered by the GN",
    "url": "https://www.wireshark.org/docs/wsug_html_chunked/ChStatFlowGraph.html"
  },
  "photo-lighttable": {
    "file": "photo-lighttable.webp",
    "w": 640,
    "h": 350,
    "credit": "darktable lighttable screenshot by สาริศ ธนาโสภณ (T.saris), CC BY-SA 4.0, via Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "url": "https://commons.wikimedia.org/wiki/File:Darktable_4.4.2_with_a_film_roll_opened_in_lighttable_view.png"
  }
}
