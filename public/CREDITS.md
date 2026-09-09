# Asset credits and licences

Every media file committed to this repository is free for commercial use. This
file records where each one came from and under what terms, so the licence
position is auditable rather than assumed.

Neither licence below requires attribution. This file exists because knowing
what you are shipping is worth more than the two minutes it took to write.

---

## Hero video

| | |
| --- | --- |
| File | `videos/hero.mp4` (2.7 MB, 1280x720, 9s) and `images/hero-poster.jpg` |
| Title | Construction workers at a house under construction |
| Source | Mixkit — <https://mixkit.co/free-stock-video/construction-workers-at-a-house-under-construction-1459/> |
| Licence | **Mixkit Free License** — commercial use permitted, no attribution required |

### Read this before swapping the clip

Mixkit publishes **two** video licences and the difference matters:

- **Free License** — personal *and* commercial use.
- **Restricted License** — personal, non-commercial only. Cannot be used on a
  business website.

Both appear under the same "Free Stock Video" heading and both download without
payment, so the label on the page is not a reliable signal. Check the page
source for `data-license="videoFree"` before using any Mixkit clip here. Three
of the first four construction clips reviewed for this project were Restricted.

---

## Photography

All photographs are from **Pexels**, under the
[Pexels License](https://www.pexels.com/license/): free for commercial and
non-commercial use, no attribution required, no permission needed.

| File | Subject | Pexels ID |
| --- | --- | --- |
| `images/projects/banana-island-residence.jpg` | Modern villa exterior | 7031594 |
| `images/projects/meridian-tower.jpg` | Glass office tower | 19821492 |
| `images/projects/harbourline-hotel.jpg` | Hotel lobby interior | 31080809 |
| `images/projects/ogui-innovation-hub.jpg` | Open-plan workspace | 18033178 |
| `images/projects/nassarawa-civic-library.jpg` | Reading room with shelving | 9959711 |
| `images/projects/oniru-penthouse.jpg` | Interior with full-height glazing | 18426842 |
| `images/studio.jpg` | Architects working in a studio | 8837443 |
| `images/og-default.jpg` | Villa courtyard, cropped to 1200x630 | 7031604 |

Any Pexels image can be re-fetched or re-cropped through its CDN:

```
https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1067
```

Passing both `w` and `h` with `fit=crop` is what forces a landscape crop. Two of
these arrived portrait without it, which crops badly in the landscape cards.

---

## What is deliberately NOT here

**Team portraits.** The four people on `/about/team` are placeholder names, and
putting stock photographs of real people beside invented job titles at a named
company would present fabricated staff as real. The team cards fall back to a
branded panel instead. Add real photographs of real colleagues through Sanity.

**Team, project and testimonial imagery generally.** Everything above is
*fallback* content, shown only while Sanity is unconfigured. Once the CMS has
documents, its images win. Replace this stock with photographs of buildings
DICKALO actually built before launch — on a construction firm's site, real work
is the entire argument.


## Generated architectural concepts

The redesign adds `images/generated/courtyard-residence.webp` and `images/generated/sculptural-interior.webp`, created using the built-in imagegen tool. These are concept visuals; they do not depict verified company projects. Prompts and processing details are recorded in `images/generated/README.md`. Existing stock footage is presented as a construction study, not footage of a named DICKALO site.

## Lagos construction film — redesign revision

- Local video: `videos/lagos-construction.mp4` (16 seconds, 1280×720, H.264, silent).
- Local poster: `images/lagos-construction-poster.jpg` (frame from the same footage).
- Creator: **Vitalis Nwenyi**.
- Source: [Construction, Akoka Yaba, Lagos Nigeria](https://www.pexels.com/video/construction-akoka-yaba-lagos-nigeria-27531033/).
- Original file: `https://videos.pexels.com/video-files/27531033/12161778_3840_2160_30fps.mp4`.
- Terms: [Pexels License](https://www.pexels.com/license/). The website identifies this as a Lagos construction study; it is not presented as a verified DICKALO project.

## Illustrative portrait photography

The revised testimonial layout uses real licensed photographs as illustrative placeholders when no client photo exists in Sanity. The visible portrait caption identifies this use. These people are not asserted to be the named clients or to have supplied the quotes. Actual CMS client photography takes priority.

| Local file | Photographer | Source |
| --- | --- | --- |
| `images/portraits/portrait-1.webp` | kehinde solomon o ogunsanya | [Smiling Elegant Businesswoman](https://www.pexels.com/photo/smiling-elegant-businesswoman-14840188/) |
| `images/portraits/portrait-2.webp` | Iheukwumere Isaac | [Portrait of a Smiling Man](https://www.pexels.com/photo/portrait-of-a-smiling-man-4660049/) |
| `images/portraits/portrait-3.webp` | Evlogia Pictures | [Portrait of a Woman Smiling](https://www.pexels.com/photo/portrait-of-a-woman-smiling-13750433/) |
| `images/portraits/portrait-4.webp` | Abdulkadir muhammad sani | [Portrait of a Smiling Nigerian Man in Traditional Attire](https://www.pexels.com/photo/portrait-of-a-smiling-nigerian-man-in-traditional-attire-31694789/) |
| `images/portraits/portrait-5.webp` | Rahman Impression | [Portrait of a Woman Smiling](https://www.pexels.com/photo/portrait-of-a-woman-smiling-17332621/) |

All five are used under the [Pexels License](https://www.pexels.com/license/) and optimized to WebP. The earlier restriction on stock team portraits remains applicable to the team pages; this explicitly labelled testimonial illustration is a separate use requested in the redesign revision.

## Footer landscape

`images/generated/footer-landscape.webp` is an original AI-generated architectural concept of tropical courtyard homes beside a lagoon. Generated with the built-in image-generation tool for the footer; not a photograph of a completed DICKALO project. The generation prompt is recorded in `images/generated/README.md`.

## Modern Nigerian garden house

`images/generated/nigerian-garden-house.webp` is an original AI-generated concept of a modern Nigerian home with a private landscaped compound. Created with the built-in image-generation tool and optimized as WebP. It replaces the lagoon scene in the footer; the prior image is retained. Exact prompt: `images/generated/README.md`.

## Garden house with sky — current footer

`images/generated/nigerian-garden-sky.webp` is an original architectural concept generated with the built-in image tool. It shows a contemporary Nigerian home in a lush garden beneath a natural blue sky and has no transparency. `images/generated/garden-sky-roofline.svg` is a layout mask for placing the house in front of the HTML wordmark; it is not a replacement sky or separate generated scene. Prompt: `images/generated/README.md`.
