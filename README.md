# Kashish Goel Portfolio

Open `START-HERE.html` or `index.html` to view the portfolio. It works from a shared folder without an installation step.

The portfolio has one scrolling page. Work jumps to the projects, About returns to the hero introduction, and Contact jumps to the three-column footer. The hero curve, moving circles, text colour mask and project scroll reveal use the main portfolio's motion system.

## Add a project PDF

1. Put a PDF in `assets/pdfs/`, for example `foundation.pdf`.
2. Open `content.js` and find the matching project.
3. Change its empty `pdf` value to a relative path, for example `pdf: 'assets/pdfs/foundation.pdf'`.

The project title, image and diagonal arrow then open that PDF inside the portfolio. The viewer includes a Back to portfolio button and an Open PDF link. Until a PDF is supplied, it shows a clear placeholder instead of a broken document.

## Edit content and images

Edit project titles, contact details and PDF paths in `content.js`. The six supplied project images are mapped there; see `assets/REPLACE-IMAGES.md` for the filename-to-project list.

Colours: `#26141A` background, `#DBCCB5` text, white hero and scrolling circles, and `#847225` circle-over-text accent. Unbounded is used for headings and navigation; Poppins is used for body copy. Fonts are bundled in `assets/fonts/`.
