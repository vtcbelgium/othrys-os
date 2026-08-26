/**
 * Frozen origin compose oracle — NOT the canonical implementation.
 * Copied from vtc-platform src/whiteSquare.js at SHA
 * 032a47ca0fa0731febdf47f45607983ac9b721b4, with background-removal removed
 * so pre/post comparison can run without @imgly. Used only by browser tests.
 */
export function originOracleToWhiteSquare(fileOrBlob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 800;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;
        try {
          const tmp = document.createElement("canvas");
          tmp.width = img.width;
          tmp.height = img.height;
          const tctx = tmp.getContext("2d");
          tctx.drawImage(img, 0, 0);
          const d = tctx.getImageData(0, 0, img.width, img.height).data;
          let minX = img.width,
            minY = img.height,
            maxX = 0,
            maxY = 0,
            found = false;
          for (let y = 0; y < img.height; y++)
            for (let x = 0; x < img.width; x++) {
              if (d[(y * img.width + x) * 4 + 3] > 20) {
                found = true;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          if (found && maxX > minX && maxY > minY) {
            sx = minX;
            sy = minY;
            sw = maxX - minX + 1;
            sh = maxY - minY + 1;
          }
        } catch (cropErr) {
          console.warn("bbox trim skipped:", cropErr);
        }
        const M = 0.86;
        const scale = Math.min((SIZE * M) / sw, (SIZE * M) / sh);
        const w = sw * scale,
          h = sh * scale;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.drawImage(img, sx, sy, sw, sh, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88);
      };
      img.onerror = () => resolve(null);
      img.src = ev.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(fileOrBlob);
  });
}
