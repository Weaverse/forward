/**
 * Static journal fixture records. Only the data source may import this file.
 * `walking-the-long-light` is the approved route-smoke article handle.
 */

import type { JournalArticle } from "../types";
import { EDITORIAL_IMAGES } from "./editorial-images";

export const JOURNAL_FIXTURES: readonly JournalArticle[] = [
  {
    handle: "walking-the-long-light",
    title: "Walking the Long Light",
    excerpt:
      "Field notes from a week of low sun, long shadows, and unhurried miles.",
    plate: "No. 01",
    publishedAt: "2026-07-18",
    readingMinutes: 6,
    location: "Cairngorms, Scotland",
    coordinates: "57.0776° N, 3.6710° W",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
    body: [
      {
        type: "paragraph",
        text: "There is a month in the northern year when the sun never quite commits. It rises late, tracks low along the ridgeline, and spends the whole day looking like late afternoon. Photographers call it endless golden hour. Walkers call it a problem of arithmetic: eight hours of usable light, twenty miles of intention.",
      },
      {
        type: "paragraph",
        text: "We planned the week around that arithmetic. Short approaches, long ridges, camps set before the color drained out of the west. The plan survived exactly one day, which is about average, and the week was better for it.",
      },
      { type: "heading", text: "The case for slow miles" },
      {
        type: "paragraph",
        text: "Low light rearranges priorities. You stop optimizing for distance and start optimizing for attention — the frost pattern on a fence post, the way a burn cuts silver through black peat, the exact moment the shadow of one hill climbs the flank of the next. None of it counts as progress. All of it counts.",
      },
      {
        type: "pullquote",
        text: "You stop optimizing for distance and start optimizing for attention.",
      },
      {
        type: "image",
        image: EDITORIAL_IMAGES.campTent,
        caption:
          "Camp set early, for once. The rule of the week: stakes in before the color goes.",
      },
      { type: "heading", text: "What worked" },
      {
        type: "paragraph",
        text: "Layers that vent without stopping. A pack that lets shoulders roll. Footwear that treats wet as a state of mind rather than an emergency. The kit list at the bottom of this note is short because the days demanded it — everything had to earn its place twice: once on the back, once in use.",
      },
      {
        type: "note",
        label: "Field note",
        text: "Sunset at 15:41. Headlamps are not optional equipment in the long-light season; they are the second half of the day.",
      },
      {
        type: "paragraph",
        text: "By the last morning the arithmetic had inverted. We were no longer spending light to buy miles; we were spending miles to stay inside the light. That is the whole trick of the season, and probably of the sport.",
      },
    ],
  },
  {
    handle: "the-thirty-liter-rule",
    title: "The Thirty-Liter Rule",
    excerpt:
      "Why the honest day pack is bigger than you think, and smaller than you fear.",
    plate: "No. 02",
    publishedAt: "2026-06-02",
    readingMinutes: 4,
    location: "Dolomites, Italy",
    coordinates: "46.4102° N, 11.8440° E",
    heroImage: EDITORIAL_IMAGES.trailMovement,
    body: [
      {
        type: "paragraph",
        text: "Every gear closet contains the same argument, fought in liters. The twenty-liter pack that looks fast and carries nothing. The forty-five that swallows a weekend and rides like furniture. Somewhere between them is the honest number for a full mountain day, and after years of getting it wrong in both directions we keep arriving at thirty.",
      },
      { type: "heading", text: "The audit" },
      {
        type: "paragraph",
        text: "Run the audit on any long day: shell, insulation, two liters of water, food you actually want to eat, first aid, headlamp, and the margin — the space for a stripped layer, a wet fly, a friend's overflow. The margin is the part the twenty-liter pack pretends you will not need. The mountain disagrees, reliably, sometime after two in the afternoon.",
      },
      {
        type: "pullquote",
        text: "The margin is the part the small pack pretends you will not need.",
      },
      {
        type: "paragraph",
        text: "Thirty liters half-full carries better than twenty liters compressed to bursting. Fabric is lighter than regret. That is the whole rule, and it fits on an index card.",
      },
      {
        type: "note",
        label: "Field note",
        text: "A pack that compresses well makes the rule work both ways — thirty liters cinched down is a day pack; opened up, it is shelter for everything the day produced.",
      },
    ],
  },
  {
    handle: "a-defense-of-heavy-weather",
    title: "A Defense of Heavy Weather",
    excerpt:
      "The best days outside rarely happen under a blue sky. An argument for going anyway.",
    plate: "No. 03",
    publishedAt: "2026-04-14",
    readingMinutes: 5,
    location: "Lofoten, Norway",
    coordinates: "68.1102° N, 13.6213° E",
    heroImage: EDITORIAL_IMAGES.campfire,
    body: [
      {
        type: "paragraph",
        text: "The forecast said stay home. It usually does, in the places worth going. Forty knots on the tops, rain arriving sideways by noon, cloud down to the shoulder of the fjord. We went anyway — not out of bravado, but because the alternative was watching weather through glass, and weather through glass is just television.",
      },
      { type: "heading", text: "What the brochure leaves out" },
      {
        type: "paragraph",
        text: "Heavy weather edits a landscape honestly. It empties the trailheads, silences the drone pilots, and reduces the day to essentials: navigation you trust, layers that work, and the specific, unphotographable pleasure of being warm inside your hood while the world tears past outside it.",
      },
      {
        type: "pullquote",
        text: "Weather through glass is just television.",
      },
      {
        type: "image",
        image: EDITORIAL_IMAGES.campfire,
        caption:
          "The reward structure of heavy weather: fire, shelter, and the story already improving.",
      },
      {
        type: "paragraph",
        text: "There are rules. You do not defend heavy weather on exposed ridges, over water that can take you, or with people who did not sign up for it. The defense is of discomfort, not of danger — the two get confused only by people who have not spent enough time in either.",
      },
      {
        type: "note",
        label: "Field note",
        text: "Test days for gear are heavy days. A shell that works in April in Lofoten has told you everything it will ever need to say.",
      },
    ],
  },
] as const;
