import * as path from 'path';
import * as fs from 'fs';

export default async function handler(req, res) {
  const { route } = req.query;
  const fileUrl = route.join('/');
  // Use env: MOSAIC_SNAPSHOT_DIR="<folder-containing-mosaic-build-output>" for what data you want to serve
  const mosaicSnapshotDir = process.env.MOSAIC_SNAPSHOT_DIR || 'public/snapshots/latest';
  // Find the absolute path for  the file/dir requested
  const filePath = path.join(process.cwd(), `${mosaicSnapshotDir}/${fileUrl}`);
  try {
    const stats = fs.statSync(filePath);
    if (stats !== undefined) {
      if (stats.isDirectory()) {
        res.status(302).json({ redirect: `/${fileUrl}/index` });
      } else {
        const realPath = fs.realpathSync(filePath);
        if (path.extname(realPath) === '.json') {
          res.setHeader('Content-Type', 'application/json');
        } else if (path.extname(realPath) === '.mdx') {
          res.setHeader('Content-Type', 'text/mdx');
        } else if (path.extname(realPath) === '.xml') {
          res.contentType('application/xml');
        }
        const data = fs.readFileSync(realPath);
        res.status(200).send(data.toString());
      }
    } else {
      console.error(`[Mosaic] ${fileUrl} not found in static data... sending 404..\n`);
      res.status(404).end();
      return;
    }
  } catch (e) {
    console.error(`[Mosaic] ${fileUrl} :`, e);
    res.status(500).end();
  }
}
