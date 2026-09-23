function client() {
  const report = window.JUNCTION_REVIEW;
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  let page = 0;
  let selected = null;
  let detailedName = null;
  const selections = new Map();
  const pageSize = 24;
  const svgAtWeight = (svg) =>
    svg.replace(
      /stroke-width="([\d.]+)"/g,
      (_, w) =>
        `stroke-width="${(Number(w) * Number($("#weight").value)) / 0.67}"`,
    );
  const base = (name) =>
    name.replace(/(_solid)?\.svg$/, "").replaceAll("-", " ");
  const features = (record) => [
    ...record.joins,
    ...record.candidates.flatMap((c) =>
      c.sectors?.length
        ? c.sectors.map((sector, i) => ({
            ...c,
            id: `${c.id}.${i + 1}`,
            parentId: c.id,
            candidateSector: sector,
          }))
        : [c],
    ),
  ];
  const weldCount = (record) => record.joins.filter((join) => join.expected !== "softened-opening").length;
  const openingCount = (record) => record.joins.filter((join) => join.expected === "softened-opening" && join.observations.some((observation) => observation.status === "visible")).length;
  const hiddenOpeningCount = (record) => record.joins.filter((join) => join.expected === "softened-opening" && !join.observations.some((observation) => observation.status === "visible")).length;
  const needsCheck = (record) => record.joins.some((join) =>
    join.observations.some((observation) =>
      observation.status !== "visible"
    )
  );
  const label = (f) =>
    f.construction
      ? `${f.expected === "softened-opening" ? "softened opening" : f.construction}: ${f.sector}`
      : `${f.kind.replaceAll("-", " ")}${f.candidateSector ? ` · sector ${f.id.split(".").at(-1)}` : ""}`;
  function drawDetail() {
    const record = report.records.find((r) => r.name === selected);
    if (!record) {
      $("#detail").hidden = true;
      detailedName = null;
      return;
    }
    if (detailedName !== record.name) {
      $("#marks").value = "all";

      detailedName = record.name;
    }
    $("#detail").hidden = false;
    $("#detail-title").textContent = record.name;
    $("#decision").textContent = record.review.reason;
    const list = features(record);
    $("#feature").innerHTML =
      '<option value="">All marked locations</option>' +
      list
        .map(
          (f) =>
            `<option value="${esc(f.id)}">${esc(f.id)} · ${esc(label(f))}</option>`,
        )
        .join("");
    $("#feature").value = selections.get(record.name) ?? "";
    $("#native").innerHTML = [12, 16]
      .map(
        (size) =>
          `<figure><span style="width:${size}px;height:${size}px">${svgAtWeight(record.svg)}</span><figcaption>${size}px</figcaption></figure>`,
      )
      .join("");
    function highlight() {
      const feature = list.find((f) => f.id === $("#feature").value);
      selections.set(record.name, $("#feature").value);
      const mode = $("#marks").value;
      const visible = list.filter(
        (f, index) =>
          (!feature
            ? !f.parentId ||
              list.findIndex((v) => v.parentId === f.parentId) === index
            : feature === f) &&
          (mode === "all" ||
            (mode === "joins" ? f.construction : mode === "structural" ? f.construction || ["contour-corner", "centerline-crossing"].includes(f.kind) : !f.construction)),
      );
      const priority = { "contour-corner": 0, "centerline-crossing": 1, "tight-curve": 2, "paint-envelope-contact": 3, "coincident-boundary": 4, "contact-region": 5, "near-contact": 6 };
      const sorted = [...visible].sort((a, b) => Number(Boolean(b.construction)) - Number(Boolean(a.construction)) || (priority[a.kind] ?? 99) - (priority[b.kind] ?? 99));
      const markers = sorted.filter((item, index) => item.construction || !sorted.slice(0, index).some((earlier) => !earlier.construction && Math.hypot(earlier.x - item.x, earlier.y - item.y) < 0.16));
      const overlays = markers
        .map((f) => {
          const p = f.point ?? [f.x, f.y];
          const color = f.expected === "softened-opening" ? "var(--opening)" : f.construction ? "var(--join)" : "var(--candidate)";
          const curve = f.curvePoints
            ? `<polyline points="${f.curvePoints.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width=".12"/>`
            : "";
          const sector = feature?.candidateSector;
          const rays = sector
            ? [sector.fromDegrees, sector.toDegrees]
                .map(
                  (angle) =>
                    `<line x1="${p[0]}" y1="${p[1]}" x2="${p[0] + 0.8 * Math.cos((angle * Math.PI) / 180)}" y2="${p[1] + 0.8 * Math.sin((angle * Math.PI) / 180)}" stroke="${color}" stroke-width=".09"/>`,
                )
                .join("")
            : "";
          return `${curve}${rays}<g class="marker${feature ? " selected" : ""}" data-feature="${esc(f.id)}"><circle cx="${p[0]}" cy="${p[1]}" r=".21" fill="${color}" stroke="white" stroke-width=".05"/><text x="${p[0] + 0.24}" y="${p[1] - 0.22}" fill="${color}" stroke="var(--paper)" stroke-width=".1" paint-order="stroke" font-size=".5">${esc(feature ? f.id : (f.parentId ?? f.id))}</text></g>`;
        })
        .join("");
      $("#drawing").innerHTML = svgAtWeight(record.svg).replace(
        /<\/svg>\s*$/,
        `${overlays}</svg>`,
      );
      if (!feature) {
        $("#feature-detail").innerHTML =
          `<p>${weldCount(record)} traced welds; ${openingCount(record)} visible softened openings; ${hiddenOpeningCount(record)} unexposed opening traces; ${record.candidates.length} possible contacts or corners found independently.</p><p>All traced treatments and scanned contacts or corners are shown. Tap a dot to inspect it. A scanned point may be a deliberate sharp exterior corner; unmarked locations still need visual review.</p>${["add-document.svg", "add-document_solid.svg", "add-to-grid.svg", "add-to-grid_solid.svg"].includes(record.name) ? "<p>The separate plus is fitted after the container and its four softened roots are not counted by this construction trace. Inspect them in the complete drawing.</p>" : ""}`;
      } else if (feature.construction) {
        $("#feature-detail").innerHTML =
          `<strong>${esc(feature.id)} · ${esc(label(feature))}</strong><p>${feature.expected === "softened-opening" ? "The tile corner is softened in the outline, not a join between separate objects. Check the observations below: a solid fill can hide this curve entirely." : "This construction intends a welded join."}</p><table><thead><tr><th>Weight</th><th>Observed edge</th><th>Exposed radius</th></tr></thead><tbody>${feature.observations.map((o) => `<tr><td>${Number(o.weight.toFixed(3))}</td><td>${esc(o.status)}</td><td>${o.exposedRadius === null ? "—" : o.exposedRadius.toFixed(2)}</td></tr>`).join("")}</tbody></table><p>“Occluded” can be deliberate in solid artwork. “Submerged” means the curve is too small for this stroke. Neither is automatically approved.</p>`;
      } else {
        $("#feature-detail").innerHTML =
          `<strong>${esc(feature.id)} · ${esc(label(feature))}</strong><p>Possible relationship requiring classification; this is not a confirmed defect.</p>${feature.candidateSector ? `<p>Sector from ${feature.candidateSector.fromDegrees}° to ${feature.candidateSector.toDegrees}°. Each sector needs a decision.</p>` : ""}`;
      }
    }
    $("#feature").onchange = highlight;
    $("#marks").onchange = highlight;
    $("#drawing").onclick = (event) => {
      const marker = event.target.closest("[data-feature]");
      if (marker) {
        $("#feature").value = marker.dataset.feature;
        highlight();
      }
    };
    highlight();
  }
  function render() {
    const q = $("#search")
      .value.toLowerCase()
      .replace(/[\s_-]/g, "");
    const filter = $("#status").value;
    const rows = report.records.filter(
      (r) =>
        r.name.replace(/[\s_-]/g, "").includes(q) &&
        (filter === "all" ||
          (filter === "candidates"
            ? r.candidates.length
            : filter === "needs-check"
              ? needsCheck(r)
              : r.review.status === filter)),
    );
    const pages = Math.max(1, Math.ceil(rows.length / pageSize));
    page = Math.min(page, pages - 1);
    $("#count").textContent =
      `${rows.length} of ${report.records.length} exports · page ${page + 1} of ${pages}`;
    $("#previous").disabled = page === 0;
    $("#next").disabled = page + 1 === pages;
    $("#grid").innerHTML = rows
      .slice(page * pageSize, (page + 1) * pageSize)
      .map(
        (r) =>
          `<button class="card" data-name="${esc(r.name)}"><span class="card-art">${svgAtWeight(r.svg)}</span><strong>${esc(base(r.name))}</strong><span>${r.name.endsWith("_solid.svg") ? "Solid" : "Outline / single"} · ${esc(r.review.status)}</span><small>${weldCount(r)} welds · ${openingCount(r)} exposed openings · ${hiddenOpeningCount(r)} hidden traces · ${r.candidates.length} candidates</small></button>`,
      )
      .join("");
    drawDetail();
  }
  $("#summary").textContent =
    `${report.summary.exports} exports mapped · ${report.summary.reviewed} reviewed · ${report.summary.pending} pending · ${report.records.filter(needsCheck).length} with measured joins to inspect`;
  $("#search").oninput = $("#status").onchange = () => {
    page = 0;
    render();
  };
  $("#weight").onchange = render;
  $("#theme").onclick = () => {
    const dark = document.body.classList.toggle("dark");
    $("#theme").textContent = dark ? "Light background" : "Dark background";
  };
  $("#previous").onclick = () => {
    page--;
    render();
  };
  $("#next").onclick = () => {
    page++;
    render();
  };
  $("#grid").onclick = (e) => {
    const card = e.target.closest("[data-name]");
    if (card) {
      selected = card.dataset.name;
      drawDetail();
      $("#detail").scrollIntoView({ block: "start" });
    }
  };
  $("#close-detail").onclick = () => {
    selected = null;
    drawDetail();
  };
  const requested = new URLSearchParams(location.search).get("icon");
  if (report.records.some((record) => record.name === requested)) {
    selected = requested;
    $("#search").value = base(requested);
  }
  render();
}

export function renderJunctionReviewPage(report) {
  const json = JSON.stringify(report).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Salt intersection map</title><style>
  :root{--bg:#f3f6f5;--paper:#fff;--ink:#193340;--muted:#526873;--line:#bdcdd3;--join:#08735c;--opening:#2356a3;--candidate:#b04018;color-scheme:light}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 Arial,sans-serif}body.dark{--bg:#10202a;--paper:#192e3b;--ink:#edf6fa;--muted:#b7cbd4;--line:#4b6572;--join:#70ddc1;--opening:#96bdff;--candidate:#ffb38d;color-scheme:dark}main{max-width:1200px;margin:auto;padding:24px}h1{font-size:clamp(28px,5vw,40px);line-height:1.1}p{max-width:850px}button,input,select{font:inherit;color:inherit;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:9px;min-height:44px;max-width:100%}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #2999c4;outline-offset:2px}label{display:grid;gap:5px;font-size:13px;min-width:0}.controls{display:flex;flex-wrap:wrap;align-items:end;gap:12px;margin:22px 0}.search{flex:1;min-width:180px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.card{display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 12px;text-align:center;min-width:0}.card strong{overflow-wrap:anywhere}.card span,.card small{font-size:12px}.card-art svg{width:32px;height:32px}.card-art{margin:10px}small,#summary,#count{color:var(--muted)}.pages{display:flex;gap:12px;align-items:center;margin:22px 0}#detail{scroll-margin-top:16px;padding:22px;margin:24px 0;background:var(--paper);border:1px solid var(--line);border-radius:8px}#detail[hidden]{display:none}.detail-head{display:flex;justify-content:space-between;align-items:start;gap:12px}.detail-head h2{margin:0;font-size:22px;overflow-wrap:anywhere}.detail-body{display:grid;grid-template-columns:300px 1fr;gap:24px}#drawing{width:280px;max-width:100%;aspect-ratio:1}#drawing svg{display:block;width:100%;height:100%;overflow:visible}#native{display:flex;gap:40px;align-items:end;justify-content:center;padding:20px}figure{margin:0;display:grid;justify-items:center;gap:8px}figure span,figure svg{display:block;width:100%;height:100%}figcaption{font-size:12px}#feature-detail{font-size:14px;overflow-wrap:anywhere}#feature-detail table{border-collapse:collapse;width:100%;font-size:12px}td,th{text-align:left;border-bottom:1px solid var(--line);padding:8px 4px}.marker{cursor:pointer}.marker text{display:none}.marker.selected text{display:block}#feature{width:100%}.legend{font-size:12px}.legend b{color:var(--join)}.legend i{color:var(--opening);font-style:normal}.legend em{font-style:normal;color:var(--candidate)}footer{border-top:1px solid var(--line);padding-top:20px;font-size:13px;color:var(--muted)}@media(max-width:850px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.detail-body{grid-template-columns:1fr}#drawing{margin:auto}}@media(max-width:550px){main{padding:16px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.card{padding:12px 8px}#detail{padding:14px}.search{flex-basis:100%}.detail-head h2{font-size:18px}.controls{gap:9px}}
  </style></head><body><main><h1>Intersection map</h1><p>Every export is listed here. Green curves are structural welds, blue curves are traced softened-opening constructions (which can be hidden by a solid fill), and orange dots are independently scanned contacts and corners. All locations are shown when you open an icon. A zero traced-feature count does not mean the drawing has no joins. Scanned points need visual judgment, not automatic welding. Welding applies where members connect. Soft corners in separate openings are contour choices: Bank's roof opening stays sharp, Trust-01 mixes sharp and soft turns within one inner shield, and Grid follows Blockchain's softened square apertures without its cells touching.</p><p><a href="reference-rule.html">Compare these supplied references</a></p><p id="summary"></p><div class="controls"><label class="search">Find an icon<input id="search" type="search" placeholder="Try buildings, call or calendar"></label><label>Review status<select id="status"><option value="all">All exports</option><option value="pending">Pending</option><option value="current">Reviewed</option><option value="stale">Changed since review</option><option value="needs-check">Joins to inspect</option><option value="candidates">With candidates</option></select></label><label>Line weight<select id="weight"><option value="1.3333333333333333">Standard · 1⅓</option><option value="1">Light · 1</option><option value=".67">Reference · .67</option><option value="1.5">Heavy · 1.5</option></select></label><button id="theme">Dark background</button></div><section id="detail" hidden><div class="detail-head"><h2 id="detail-title"></h2><button id="close-detail">Close</button></div><p id="decision"></p><div class="detail-body"><div><div id="drawing"></div><div id="native"></div><p class="legend"><b>Green: structural welds</b> · <i>Blue: opening traces</i> · <em>Orange: scanned candidates</em></p></div><div><div class="controls"><label>Show marks<select id="marks"><option value="all">All locations</option><option value="structural">Corners and crossings</option><option value="joins">Traced treatments</option><option value="candidates">All candidates</option></select></label></div><label>Inspect a location<select id="feature"></select></label><div id="feature-detail" aria-live="polite"></div></div></div></section><p id="count" aria-live="polite"></p><div id="grid" class="grid"></div><div class="pages"><button id="previous">Previous</button><button id="next">Next</button></div><footer>Generated evidence is not visual approval. Pending items remain pending until reviewed; artwork or evidence changes invalidate previous approval. The scan is conservative and cannot prove that every meaningful contact was discovered. Review the complete drawing too.</footer></main><script>window.JUNCTION_REVIEW=${json};(${client.toString()})();</script></body></html>`;
}
