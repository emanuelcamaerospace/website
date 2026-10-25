# Thesis page — adding media

`thesis.html` has "slots" that fill themselves. Drop a file into `thesis/media/`
with one of the names below and it appears on the page — no HTML editing needed.
Until then a neat "coming soon" placeholder is shown.

Tip: open `thesis.html?slots` in the browser to see each slot's expected file name.

Images: `.webp`, `.jpg` or `.png` (webp preferred, ~1600 px wide, < 400 KB)
Videos: `.mp4` (H.264, < 15 MB; add `hero-poster.jpg` for a cover frame)

| File name (in thesis/media/) | Where it shows             | What to put there                               |
|------------------------------|----------------------------|-------------------------------------------------|
| hero.mp4 (+ hero-poster.jpg) | Top of page, 16:9          | Best field-test clip: tracking / lock-on        |
| architecture                 | System section, wide       | Block diagram of the full system                |
| simulink-model               | Simulation, wide           | Screenshot of the top-level Simulink model      |
| tracking-response            | Simulation, 4:3            | Pointing / tracking error vs time plot          |
| ga-convergence               | Simulation, 4:3            | Genetic algorithm fitness vs generation         |
| prototype                    | Prototype, wide            | Best photo of the assembled prototype           |
| cad-render                   | Prototype, 4:3             | CAD render / exploded view of the gimbal        |
| electronics                  | Prototype, 4:3             | Pixhawk, wiring, power board close-up           |
| field-test-1                 | Results, 4:3               | Photo from the field campaign                   |
| envelope                     | Results, 4:3               | Interception envelope plot                      |

Plots (diagram/Simulink/plots) are shown "contained" on a dark background, so
export them with a transparent or dark background for the best look.

## Documents
These buttons switch on automatically once the file exists (on the live site):

- `thesis/MSc_Thesis_Emanuel_Camacho.pdf`
- `thesis/Extended_Abstract.pdf`
- `thesis/Defence_Slides.pdf`

## Results numbers
In `thesis.html`, search for `RESULTS:` — replace each `—` with the value and
remove the word `pending` from that card's class. Edit labels/units to match
what you actually report.

## Timeline
Search for `Update statuses` in `thesis.html`; each pill takes `done`, `active`
or nothing (upcoming).

Check with your supervisors / the Air Force what is cleared before publishing
photos or numbers.
