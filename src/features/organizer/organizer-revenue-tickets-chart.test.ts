import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Source-contract test: this project has no DOM test runner, so the chart's
// structural guarantees are asserted against its source, matching the style of
// organizer-phase-four-source-contract.test.ts.
const chart = readFileSync(
  "src/features/organizer/components/OrganizerRevenueTicketsChart.tsx",
  "utf8",
);

test("renders the overview statistics as a single line chart with two series", () => {
  // One inline SVG holding two line series (polyline/path), not columns.
  assert.match(chart, /<svg/, "expected an inline SVG line chart");
  assert.match(chart, /<polyline|<path/, "expected polyline/path line series");
  // The old sibling column plots and their <rect> bars must be gone.
  assert.doesNotMatch(
    chart,
    /function ColumnPlot/,
    "the sibling column plots must be removed",
  );
  assert.doesNotMatch(
    chart,
    /lg:grid-cols-2/,
    "the two-column plot grid must be removed",
  );
  // The data table below the chart must be removed entirely.
  assert.doesNotMatch(chart, /<table/, "the data table must be removed");
});

test("keeps two labelled series with a legend and a shared percentage scale", () => {
  // Purple revenue + green tickets, exposed via a legend.
  assert.match(chart, /Doanh thu/, "revenue series label");
  assert.match(chart, /Vé đã bán|Vé bán|vé/, "sold-tickets series label");
  assert.match(chart, /role="list"|<ul/, "expected a legend list");
  // Units differ, so both lines share one 0–100% scale of each series' own peak.
  assert.match(chart, /%|phần trăm/, "percentage scale label");
});

test("exposes accessible labels and tooltips showing real values", () => {
  assert.match(
    chart,
    /role="img"|role="figure"/,
    "the plot needs an accessible role",
  );
  assert.match(chart, /aria-label/, "the plot needs an aria-label");
  assert.match(chart, /<title>/, "markers expose native SVG tooltips");
  // Tooltips must surface the actual revenue/ticket figures, not just the percentage.
  assert.match(chart, /toLocaleString/, "tooltips format the actual values");
});

test("keeps the timeline data contract and the zero/empty guard", () => {
  assert.match(
    chart,
    /OrganizerReportTimelineBucket/,
    "consumes the unchanged timeline contract",
  );
  assert.match(chart, /revenue/, "reads bucket revenue");
  assert.match(chart, /soldTicketCount/, "reads bucket soldTicketCount");
  assert.match(chart, /Chưa có dữ liệu/, "renders an empty-state message");
  // Horizontal overflow for many timeline buckets.
  assert.match(chart, /overflow-x-auto/, "wide charts scroll horizontally");
});
