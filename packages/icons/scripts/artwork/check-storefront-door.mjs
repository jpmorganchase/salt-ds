// Check the finished painted doorway, independently of its recipe paths.
// The closed aperture needs a flat threshold without notches or stray joins.
export async function checkStorefrontDoor(page, records) {
  const record = records.find(({name}) => name === "storefront_solid.svg");
  if (!record) throw new Error("Missing storefront doorway artwork");
  return page.evaluate(async ({svg}) => {
    const results = [], failures = [], scale = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 16 * scale;
    const ctx = canvas.getContext("2d", {willReadFrequently: true});
    for (const weight of [0.67, 1, 4/3, 1.5]) {
      const source = svg.replace(/stroke-width="([\d.]+)"/g,
        (_, v) => 'stroke-width="' + Number(v)*weight/0.67 + '"');
      const url = URL.createObjectURL(new Blob([source], {type:"image/svg+xml"}));
      try {
        const image = new Image(); image.src = url; await image.decode();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(image,0,0,canvas.width,canvas.height);
        const pixels = ctx.getImageData(0,0,canvas.width,canvas.height).data;
        const bottoms = [];
        const open = [];
        for (let x = Math.floor(9.5*scale); x < Math.ceil(12.5*scale); x++)
          if (pixels[(Math.floor(11.5*scale)*canvas.width+x)*4+3] < 128) open.push(x/scale);
        const left = Math.min(...open), right = Math.max(...open);
        const center = (left+right)/2, halfSpan = (right-left)/8;
        // Scan the central flat part, excluding the intentionally soft corners.
        for (let x = center-halfSpan; x <= center+halfSpan; x += 0.025) {
          let bottom = null;
          for (let y = Math.floor(11.8*scale); y < Math.ceil(13.5*scale); y++)
            if (pixels[(y*canvas.width + Math.floor(x*scale))*4+3] < 128)
              bottom = (y+1)/scale;
          bottoms.push(bottom);
        }
        const spread = Math.max(...bottoms)-Math.min(...bottoms);
        const result = {name:"storefront_solid.svg", weight,
          feature:"continuous flat threshold beneath the door aperture", spread};
        results.push(result);
        if (!open.length || !bottoms.length || bottoms.includes(null) || Math.min(...bottoms)<12.5 ||
            Math.max(...bottoms)>13.5 || spread > 2/scale) failures.push(result);
      } finally { URL.revokeObjectURL(url); }
    }
    return {results, failures};
  }, record);
}
