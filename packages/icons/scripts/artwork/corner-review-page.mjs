export function cornerReviewPage(report) {
  function client() {
    const $ = (s) => document.querySelector(s),
      data = window.CORNER_REVIEW;
    let selected,
      offset = 0;
    const esc = (s) =>
      String(s).replace(
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
    const inner = (r) =>
      r.observations.reduce(
        (n, o) => n + o.corners.filter((c) => c.kind === "inner").length,
        0,
      );
    const render = (r, size, marks = false) => {
      const w = +$("#weight").value,
        o = r.observations.find((o) => Math.abs(o.weight - w) < 0.001);
      let svg = r.svg
        .replace("<svg ", `<svg style="width:${size}px;height:${size}px" `)
        .replace(
          /stroke-width="([\d.]+)"/g,
          (_, n) => `stroke-width="${(+n * w) / 0.67}"`,
        );
      if (marks)
        svg = svg.replace(
          "</svg>",
          o.corners
            .map((c, i) =>
              c.kind === "outer" && !$("#outer").checked
                ? ""
                : `<g fill="${c.kind === "inner" ? "#dc461a" : c.kind === "outer" ? "#2787bf" : "#aa52d6"}" stroke="none"><circle cx="${c.x}" cy="${c.y}" r=".1"/><text x="${c.x + 0.14}" y="${c.y - 0.12}" font-size=".42">${i + 1}</text></g>`,
            )
            .join("") + "</svg>",
        );
      return svg;
    };
    const show = (r) => {
      selected = r;
      $("#detail").hidden = false;
      $("#name").textContent = r.name;
      $("#drawing").innerHTML = render(r, 288, $("#marks").checked);
      $("#native").innerHTML =
        `<figure>${render(r, 12)}<figcaption>12px</figcaption></figure><figure>${render(r, 16)}<figcaption>16px</figcaption></figure>`;
      $("#decision").textContent =
        r.review.status +
        " - " +
        (r.decision?.rationale ||
          "Final approval is pending. Inspect the complete unmarked drawing as well as these findings.");
      const wi = r.observations.findIndex(
        (o) => Math.abs(o.weight - +$("#weight").value) < 0.001,
      );
      $("#locations").innerHTML =
        r.observations[wi].corners
          .map((c, i) => {
            const d = r.decision?.decisions?.[`w${wi + 1}-${i + 1}`];
            return `<tr><td>${i + 1}</td><td>${esc(c.kind)}</td><td>${d ? esc(d.treatment + ": " + d.reason) : c.kind === "outer" ? "Keep sharp; verify visually." : "Unresolved"}</td></tr>`;
          })
          .join("") ||
        "<tr><td>No abrupt corners detected at this weight. A clean scan does not establish approval.</td></tr>";
    };
    const draw = () => {
      const q = $("#search").value.trim().toLowerCase(),
        f = $("#filter").value;
      const rows = data.records.filter(
        (r) =>
          r.name.includes(q) &&
          (f === "all" ||
            (f === "changed" && r.changed) ||
            (f === "inner" && inner(r) > 0) ||
            (f === "open" && r.review.status !== "approved") ||
            (f === "approved" && r.review.status === "approved")),
      );
      offset = Math.min(
        offset,
        Math.max(0, Math.floor((rows.length - 1) / 36) * 36),
      );
      $("#count").textContent =
        `${rows.length} exports - page ${offset / 36 + 1} of ${Math.max(1, Math.ceil(rows.length / 36))}`;
      $("#grid").innerHTML = rows
        .slice(offset, offset + 36)
        .map(
          (r) =>
            `<button class="card" data-name="${esc(r.name)}">${render(r, 32)}<strong>${esc(r.name.replace(".svg", ""))}</strong><small>${r.changed ? "Updated - " : ""}${esc(r.review.status)}</small></button>`,
        )
        .join("");
      $("#previous").disabled = !offset;
      $("#next").disabled = offset + 36 >= rows.length;
      if (selected) show(selected);
    };
    $("#search").oninput = () => {
      offset = 0;
      draw();
    };
    $("#filter").onchange = () => {
      offset = 0;
      draw();
    };
    $("#weight").onchange = draw;
    $("#marks").onchange = () => selected && show(selected);
    $("#outer").onchange = () => selected && show(selected);
    $("#previous").onclick = () => {
      offset -= 36;
      draw();
    };
    $("#next").onclick = () => {
      offset += 36;
      draw();
    };
    $("#theme").onclick = () => {
      document.body.classList.toggle("dark");
      $("#theme").textContent = document.body.classList.contains("dark")
        ? "Light background"
        : "Dark background";
    };
    $("#close").onclick = () => {
      $("#detail").hidden = true;
      selected = null;
    };
    $("#grid").onclick = (e) => {
      const b = e.target.closest("[data-name]");
      if (b) {
        show(data.records.find((r) => r.name === b.dataset.name));
        $("#detail").scrollIntoView({ behavior: "smooth" });
      }
    };
    $("#summary").textContent =
      `${data.summary.exports} exports scanned - ${data.summary.changed ?? 0} updated - ${data.summary.approved} approved under the new contract. ${data.summary.exports - data.summary.approved} await final sign-off.`;
    draw();
  }
  const json = JSON.stringify(report).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Salt - Corner consistency</title><style>
  :root{--bg:#f2f5f4;--paper:white;--ink:#16313a;--line:#bdced2;--muted:#496470;color-scheme:light}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 Arial,sans-serif}body.dark{--bg:#10212a;--paper:#1b3039;--ink:#f3f8fa;--line:#516773;--muted:#b9ccd4;color-scheme:dark}main{max-width:1100px;margin:auto;padding:24px}h1{font-size:clamp(30px,5vw,44px);line-height:1.1}a{color:inherit}p{max-width:850px}button,input,select{font:inherit;color:inherit;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:10px;min-height:44px;max-width:100%}button{cursor:pointer}button:disabled{opacity:.4}:focus-visible{outline:3px solid #2298bd;outline-offset:3px}label{display:grid;gap:5px;font-size:13px}.controls{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin:24px 0}.search{flex:1;min-width:180px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 10px;min-width:0}.card strong{font-size:13px;overflow-wrap:anywhere}small,figcaption{font-size:12px;color:var(--muted)}#detail{background:var(--paper);border:1px solid var(--line);padding:22px;scroll-margin-top:16px}#detail[hidden]{display:none}.detail-head{display:flex;justify-content:space-between;gap:12px;align-items:center}h2{font-size:22px;overflow-wrap:anywhere}.body{display:grid;grid-template-columns:320px 1fr;gap:24px}#drawing{max-width:100%;width:288px;margin:auto}#drawing svg{max-width:100%;height:auto!important}#native{display:flex;gap:40px;align-items:end;justify-content:center;padding:22px}figure{margin:0;display:grid;gap:8px;justify-items:center}.toggles{display:flex;gap:12px;flex-wrap:wrap}.toggles label{display:flex;align-items:center}.toggles input{min-height:24px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:8px;border-bottom:1px solid var(--line);text-align:left}.notice{padding:16px;border-left:4px solid #bd5b27;background:var(--paper)}footer{font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:18px}@media(max-width:850px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}.body{grid-template-columns:1fr}}@media(max-width:550px){main{padding:16px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.search{flex-basis:100%}#detail{padding:12px}.card{padding:18px 8px}}</style></head><body><main>
  <p><a href="all-icons.html">All icons</a> - <a href="reference-rule.html">Reference study</a></p><h1>Sharp outside.<br>Soft inside.</h1><p>Soften exposed inner joins and negative-space corners by default, including angled and curved shapes. Keep outward corners, tips and flat line endings sharp. Review the visible result at 12px and 16px.</p>
  <p class="notice">Work in review. Shared construction is updated; remaining findings are not approved exceptions. Crops, Globe, chart marker attachments and inverse marks need further corner decisions. Official logos retain their supplied geometry.</p><p id="summary"></p><p>The detector follows the finished painted boundary after strokes and fills combine. Orange marks are possible inner corners; purple marks are uncertain; blue marks are outward corners. It can miss small features and flag raster artifacts. It cannot judge recognition or approve an icon.</p>
  <div class="controls"><label class="search">Find an icon<input id="search" type="search" placeholder="Try battery, bank or crops"></label><label>Show<select id="filter"><option value="all">All exports</option><option value="changed">Updated artwork</option><option value="inner">Inner-corner findings</option><option value="open">Awaiting sign-off</option><option value="approved">Approved</option></select></label><label>Weight<select id="weight"><option value="1.3333333333333333">Standard - 1.33</option><option value="1">Light - 1</option><option value=".67">SVG reference - .67</option><option value="1.5">Heavy - 1.5</option></select></label><button id="theme">Dark background</button></div>
  <section id="detail" hidden><div class="detail-head"><h2 id="name"></h2><button id="close">Close</button></div><p id="decision"></p><div class="body"><div><div id="drawing"></div><div id="native"></div><div class="toggles"><label><input id="marks" type="checkbox" checked> Show findings</label><label><input id="outer" type="checkbox"> Outward corners</label></div></div><table><thead><tr><th>Point</th><th>Geometry</th><th>Decision</th></tr></thead><tbody id="locations"></tbody></table></div></section>
  <p id="count" aria-live="polite"></p><div id="grid" class="grid"></div><div class="controls"><button id="previous">Previous</button><button id="next">Next</button></div><footer>Approval requires the complete drawing, every inner/uncertain finding, both native sizes, four weights, light and dark, and component/mask checks. A retained sharp interior needs saved before/after comparisons. Artwork or detector changes invalidate approval. The previous source intersection map remains diagnostic evidence.</footer></main><script>window.CORNER_REVIEW=${json};(${client.toString()})();</script></body></html>`;
}
