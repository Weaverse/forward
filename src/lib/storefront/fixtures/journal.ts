/** Representative static Field Notes. Shopify owns the published long-form copy. */

import type { JournalArticle } from "../types";
import { EDITORIAL_IMAGES } from "./editorial-images";

export const JOURNAL_FIXTURES: readonly JournalArticle[] = [
  {
    handle: "layering-for-moving-weather",
    title: "Layering for Moving Weather",
    excerpt:
      "How to layer for long climbs, fast descents, and uncertain forecasts.",
    plate: "No. 01",
    publishedAt: "2026-07-24",
    readingMinutes: 7,
    location: "Pacific Crest Trail, California",
    coordinates: "36.5785° N, 118.2923° W",
    heroImage: EDITORIAL_IMAGES.mountainRidges,
    body: [
      {
        type: "paragraph",
        text: "Begin the climb slightly cool so the first hour does not soak the layers meant to protect the next six.",
      },
      { type: "heading", text: "Build around output" },
      {
        type: "paragraph",
        text: "A breathable base, venting midlayer, and accessible shell create more range than one heavy garment.",
      },
      {
        type: "pullquote",
        text: "The best layer is the one adjusted before discomfort becomes a problem.",
      },
    ],
  },
  {
    handle: "packing-thirty-liters-for-a-long-day",
    title: "Packing Thirty Liters for a Long Day",
    excerpt: "The honest pack list for a full mountain day.",
    plate: "No. 02",
    publishedAt: "2026-06-10",
    readingMinutes: 5,
    location: "North Cascades, Washington",
    coordinates: "48.7718° N, 121.2985° W",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
    body: [
      {
        type: "paragraph",
        text: "Thirty liters leaves margin for weather, food, water, repair, and the layer removed halfway up the first climb.",
      },
      { type: "heading", text: "Pack the margin first" },
      {
        type: "paragraph",
        text: "Shelter, insulation, navigation, and repair tools establish the load before convenience items compete for space.",
      },
    ],
  },
  {
    handle: "reading-the-trail-underfoot",
    title: "Reading the Trail Underfoot",
    excerpt: "Foot placement, pace, and terrain cues for moving efficiently.",
    plate: "No. 03",
    publishedAt: "2026-05-08",
    readingMinutes: 6,
    location: "Cairngorms, Scotland",
    coordinates: "57.0776° N, 3.6710° W",
    heroImage: EDITORIAL_IMAGES.campTent,
    body: [
      {
        type: "paragraph",
        text: "Texture changes before traction does. Loose stone, dark roots, and polished rock all announce themselves early.",
      },
      { type: "heading", text: "Pace follows information" },
      {
        type: "paragraph",
        text: "Shorter steps preserve options when the ground becomes uncertain and reduce the corrections that consume energy.",
      },
    ],
  },
  {
    handle: "how-we-test-a-shell-before-calling-it-weatherproof",
    title: "How We Test a Shell Before Calling It Weatherproof",
    excerpt:
      "Hose tests, hill days, and the point where a seam decides everything.",
    plate: "No. 04",
    publishedAt: "2026-04-22",
    readingMinutes: 8,
    location: "Lake District, England",
    coordinates: "54.4609° N, 3.0886° W",
    heroImage: EDITORIAL_IMAGES.campfire,
    body: [
      {
        type: "paragraph",
        text: "A lab number starts the test; repeated wet hill days decide whether the pattern deserves the claim.",
      },
      { type: "heading", text: "Start at the openings" },
      {
        type: "paragraph",
        text: "Cuffs, hood adjustment, pocket access, and seam intersections reveal practical weather resistance before the main fabric does.",
      },
      {
        type: "note",
        label: "Field note",
        text: "Testing continues after washing because a finish that works only when new is not a system.",
      },
    ],
  },
  {
    handle: "a-two-day-kit-built-around-nine-kilograms",
    title: "A Two-Day Kit Built Around Nine Kilograms",
    excerpt: "An overnight list with enough margin left for uncertain weather.",
    plate: "No. 05",
    publishedAt: "2026-03-19",
    readingMinutes: 9,
    location: "Snowdonia, Wales",
    coordinates: "53.0685° N, 4.0763° W",
    heroImage: EDITORIAL_IMAGES.trailMovement,
    body: [
      {
        type: "paragraph",
        text: "Nine kilograms is light enough to keep moving naturally and heavy enough to remain honest about shelter and weather.",
      },
      { type: "heading", text: "Count systems, not objects" },
      {
        type: "paragraph",
        text: "Sleep, shelter, food, water, clothing, navigation, and repair each need a complete answer before individual items are optimized.",
      },
    ],
  },
  {
    handle: "repair-notes-what-five-years-of-use-should-look-like",
    title: "Repair Notes: What Five Years of Use Should Look Like",
    excerpt:
      "Wear patterns, honest failures, and repairs that keep gear in service.",
    plate: "No. 06",
    publishedAt: "2026-02-11",
    readingMinutes: 8,
    location: "Forward Repair Desk",
    coordinates: "54.4609° N, 3.0886° W",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
    body: [
      {
        type: "paragraph",
        text: "Five years of use leaves abrasion, softened edges, and local repairs. Those marks are evidence, not defects.",
      },
      { type: "heading", text: "Read the pattern of wear" },
      {
        type: "paragraph",
        text: "Repeated stress at one seam may need reinforcement; even wear across a contact surface usually means the product is working as intended.",
      },
      {
        type: "pullquote",
        text: "Useful age is visible, specific, and repairable.",
      },
    ],
  },
];
