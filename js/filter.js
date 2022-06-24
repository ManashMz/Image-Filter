//removing all filters
function nofilter() {
  cxt.clearRect(0, 0, CVS.width, CVS.height);
  cxt.drawImage(image, 0, 0);
  imgdata = cxt.getImageData(0, 0, image.width, image.height);
  data = imgdata.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i];
    data[i + 1] = data[i + 1];
    data[i + 2] = data[i + 2];
  }
  cxt.putImageData(imgdata, 0, 0);
}

//black and white
function blackWhite() {
  data = imgdata.data;

  for (let i = 0; i < data.length / 4; i++) {
    let gray =
      data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11;
    let black = gray > 128 ? 255 : 0;

    data[i * 4] = black;
    data[i * 4 + 1] = black;
    data[i * 4 + 2] = black;
  }

  cxt.putImageData(imgdata, 0, 0);
}

//sharpen
function sharpen(w, h, mix) {
  var x,
    sx,
    sy,
    r,
    g,
    b,
    a,
    dstOff,
    srcOff,
    wt,
    cx,
    cy,
    scy,
    scx,
    weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
    katet = Math.round(Math.sqrt(weights.length)),
    half = (katet * 0.5) | 0,
    dstData = cxt.createImageData(w, h),
    dstBuff = dstData.data,
    srcBuff = cxt.getImageData(0, 0, w, h).data,
    y = h;

  while (y--) {
    x = w;
    while (x--) {
      sy = y;
      sx = x;
      dstOff = (y * w + x) * 4;
      r = 0;
      g = 0;
      b = 0;
      a = 0;

      for (cy = 0; cy < katet; cy++) {
        for (cx = 0; cx < katet; cx++) {
          scy = sy + cy - half;
          scx = sx + cx - half;

          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            srcOff = (scy * w + scx) * 4;
            wt = weights[cy * katet + cx];

            r += srcBuff[srcOff] * wt;
            g += srcBuff[srcOff + 1] * wt;
            b += srcBuff[srcOff + 2] * wt;
            a += srcBuff[srcOff + 3] * wt;
          }
        }
      }

      dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
      dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
      dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
      dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
    }
  }
  cxt.putImageData(dstData, 0, 0);
}

function soft() {
  cxt.globalAlpha = 0.5; // Higher alpha made it more smooth
  // Add blur layers by strength to x and y
  // 2 made it a bit faster without noticeable quality loss
  let strength = 1.25;
  for (let y = -strength; y <= strength; y += 2) {
    for (let x = -strength; x <= strength; x += 2) {
      // Apply layers
      cxt.drawImage(image, x, y);
      // Add an extra layer, prevents it from rendering lines
      // on top of the images (does makes it slower though)
      if (x >= 0 && y >= 0) {
        cxt.drawImage(image, -(x - 1), -(y - 1));
      }
    }
  }
  cxt.globalAlpha = 1.0;
}

function faded() {
  cxt.globalCompositeOperation = "source-over";
  cxt.fillStyle = "rgba(255, 255, 255, 0.17)";
  cxt.beginPath();
  cxt.fillRect(0, 0, CVS.width, CVS.height);
  cxt.fill();
  cxt.globalCompositeOperation = "source-over";
}

function vignette() {
  var gradient,
    outerRadius = Math.sqrt(
      Math.pow(CVS.width / 2, 2) + Math.pow(CVS.height / 2, 2)
    );

  // Adds outer darkened blur effect
  cxt.globalCompositeOperation = "source-over";
  gradient = cxt.createRadialGradient(
    CVS.width / 2,
    CVS.height / 2,
    0,
    CVS.width / 2,
    CVS.height / 2,
    outerRadius
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.8, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.6)");
  cxt.fillStyle = gradient;
  cxt.fillRect(0, 0, CVS.width, CVS.height);

  // Adds central lighten effect
  cxt.globalCompositeOperation = "lighter";
  gradient = cxt.createRadialGradient(
    CVS.width / 2,
    CVS.height / 2,
    0,
    CVS.width / 2,
    CVS.height / 2,
    outerRadius
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
  gradient.addColorStop(0.65, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  cxt.fillStyle = gradient;
  cxt.fillRect(0, 0, CVS.width, CVS.height);
}

//filterfunctions
function flterColors(r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
}

let filters = new Array();
filters.push(new flterColors(0xff, 0xff, 0xff));
filters.push(new flterColors(0xeb, 0xb1, 0x13));
filters.push(new flterColors(0x00, 0xb5, 0xff));

//grayscale
function grayscale() {
  let data = imgdata.data;
  for (let i = 0; i < data.length; i += 4) {
    let luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    let rIntensity = (filters[0].r * 50 + 255 * (100 - 50)) / 25500;
    let gIntensity = (filters[0].g * 50 + 255 * (100 - 50)) / 25500;
    let bIntensity = (filters[0].b * 50 + 255 * (100 - 50)) / 25500;

    data[i] = Math.round(rIntensity * luma);
    data[i + 1] = Math.round(gIntensity * luma);
    data[i + 2] = Math.round(bIntensity * luma);
  }
  cxt.putImageData(imgdata, 0, 0);
}

function warm() {
  let data = imgdata.data;
  for (let i = 0; i < data.length; i += 4) {
    let luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    let rIntensity = (filters[1].r * 50 + 255 * (100 - 50)) / 25500;
    let gIntensity = (filters[1].g * 50 + 255 * (100 - 50)) / 25500;
    let bIntensity = (filters[1].b * 50 + 255 * (100 - 50)) / 25500;

    data[i] = Math.round(rIntensity * luma);
    data[i + 1] = Math.round(gIntensity * luma);
    data[i + 2] = Math.round(bIntensity * luma);
  }

  cxt.putImageData(imgdata, 0, 0);
}

function cool() {
  let data = imgdata.data;
  for (let i = 0; i < data.length; i += 4) {
    let luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    let rIntensity = (filters[2].r * 50 + 255 * (100 - 50)) / 25500;
    let gIntensity = (filters[2].g * 50 + 255 * (100 - 50)) / 25500;
    let bIntensity = (filters[2].b * 50 + 255 * (100 - 50)) / 25500;

    data[i] = Math.round(rIntensity * luma);
    data[i + 1] = Math.round(gIntensity * luma);
    data[i + 2] = Math.round(bIntensity * luma);
  }

  cxt.putImageData(imgdata, 0, 0);
}

// classic

function classic() {
  cxt.globalCompositeOperation = "source-over";
  cxt.fillStyle = "rgba(255, 51, 0, 0.07)";
  cxt.beginPath();
  cxt.fillRect(0, 0, CVS.width, CVS.height);
  cxt.fill();
  cxt.globalCompositeOperation = "source-over";
}




// frost

function frost() {
  cxt.globalCompositeOperation = "source-over";
  cxt.fillStyle = "rgba(252, 233, 255, 0.2)";
  cxt.beginPath();
  cxt.fillRect(0, 0, CVS.width, CVS.height);
  cxt.fill();
  cxt.globalCompositeOperation = "source-over";
}

// blossom

function blossom() {
  cxt.globalCompositeOperation = "source-over";
  cxt.fillStyle = "rgba(255, 51, 255, 0.2)";
  cxt.beginPath();
  cxt.fillRect(0, 0, CVS.width, CVS.height);
  cxt.fill();
  cxt.globalCompositeOperation = "source-over";
}

// ivory

function ivory() {
  cxt.globalCompositeOperation = "source-over";
  cxt.fillStyle = "rgba(255, 212, 128, 0.2)";
  cxt.beginPath();
  cxt.fillRect(0, 0, CVS.width, CVS.height);
  cxt.fill();
  cxt.globalCompositeOperation = "source-over";
}


// cartoon


function start() {
  //alert("Baah");
  var myImg = $("img").prop("src");
  var myDistance = 50;
  console.log(myImg);
  var f = function(myImg) {
      //do something with returned image

  };
  var c = new comicify(myImg, myDistance, f);
};

function comicify(img, dist, outf) {
  var t = this;
  t.srcimg = img;
  t.distance = dist;
  t.outfun = outf;
  t.container = $("<div>"); //$("#resultHolder");
  t.process();
}

comicify.prototype = {
  draw: function(container) {
      var t = this;
      t.container = container;
      var input = $('<input>').val(t.distance).change(function() {
          t.distance = this.value;
          if ('' != t.srcimg[0].src) {
              t.process();
          }
      });

      container.append($('<div>').text("Directions:").append(
          $('<ul>')
          .append($('<li>').text("Set the distance to distance (manitude between color vecotrs) that defines a single (new) color"))
          .append($('<li>').text("Paste an image to the page"))
          .append($('<li>').text("Wait -- you're processing an image in Javascript..."))
      ));
      container.append($('<div>').append($('<span>').text("Distance:").width("400px")).append(input))
      t.srcimg = $('<img>');
      t.srcimg.load(function() {
          t.process()
      });
      container.on('paste', function(evt) {
          return (t.handlePaste(evt));
      });
  },
  handlePaste: function(evt) {
      var t = this;
      var items = evt.originalEvent.clipboardData.items,
          paste;
      for (var i in items) {
          if ('file' == items[i].kind) {
              var fr = new FileReader();
              console.log("Going");
              fr.onload = function(revt) {
                  t.srcimg[0].src = revt.target.result;
              }
              fr.readAsDataURL(items[i].getAsFile());
          }
      }
  },

  process: function() {
      var t = this;
      var canvas = $('<canvas>');
      var w = canvas[0].width = t.srcimg[0].width;
      var h = canvas[0].height = t.srcimg[0].height;
      var prog = $('<span>').text("Processing...");
      t.container.append(prog);
      t.ctx = canvas[0].getContext('2d');
      t.ctx.drawImage(t.srcimg[0], 0, 0);
      t.image = t.ctx.getImageData(0, 0, w, h); //array [4*w*h] of colors RGBA
      t.ctx.clearRect(0, 0, w, h);
      t.mask = Array(w);
      var zz = Array();
      for (var i = 0; i < w * h; i++) {
          zz[i] = i;
      }
      for (var i = 0; i < w; i++) {
          t.mask[i] = Array(h);
          for (var j = 0; j < h; j++) {
              t.mask[i][j] = true;
              var n = Math.floor(w * h * Math.random());
              var z = zz[n];
              zz[n] = zz[i * j];
              zz[i * j] = z;
          }
      }

      var n = 0;
      var err = "";
      var step = (w * h) / 100;
      var progress = 0;
      var fn = function() {
          if (n < (w * h) && err == "") {
              var q = Math.floor(step);
              while (q > 0 && n < (w * h) && err == "") {
                  var x = zz[n];
                  var j = Math.floor(x / w);
                  var i = x % w;

                  if (t.mask[i][j]) {
                      var y = x * 4;
                      var avgct = 0;
                      t.avg = [t.image.data[y++], t.image.data[y++], t.image.data[y++], t.image.data[y++]];
                      try {
                          t.doPoint(i, j); // do all the points next to it too...
                          t.doPaint();
                      } catch (e) {
                          if (!e.message == "Maximum call stack size exceeded") {
                              err = e.message;
                              prog.text(e.message);
                          } else {
                              t.doPaint();
                          } // ignore call stack (we'll try 
                      }
                  }
                  n++;
                  q--;
              }
              progress++;
              if (err == "") {
                  prog.text("Processing " + String(progress) + "%");
                  window.setTimeout(fn, 0.0001);
              }
          } else {
              if (err == "") {
                  prog.remove();
              }
              t.ctx.putImageData(t.image, 0, 0);
              var outImg = $('<img>');
              outImg[0].src = canvas[0].toDataURL();
              t.container.append(outImg);
          }
      };
      window.setTimeout(fn, 4);
  },
  doPaint: function() {
      var t = this;
      var w = t.srcimg[0].width;
      var h = t.srcimg[0].height;
      var avgct = 1;
      for (var i = 0; i < w; i++) {
          for (var j = 0; j < h; j++) {
              var x = 4 * (i + (j * w));
              if (null == t.mask[i][j]) {
                  for (var k = 0; k < 4; k++) {
                      t.avg[k] = ((t.avg[k] * avgct) + t.image.data[x + k]) / (avgct + 1);
                  }
                  avgct++;
              }
          }
      }
      for (var i = 0; i < w; i++) {
          for (var j = 0; j < h; j++) {
              if (null == t.mask[i][j]) {
                  var n = 4 * (i + (j * w));
                  for (var k = 0; k < 4; k++) {
                      t.image.data[n + k] = Math.floor(t.avg[k]);
                  }
                  t.mask[i][j] = 0;
              }
          }
      }
  },

  doPoint: function(i, j) {
      var t = this;
      var w = t.srcimg[0].width;
      var h = t.srcimg[0].height;
      var x = 4 * (i + (j * w));
      var p = [t.image.data[x++], t.image.data[x++], t.image.data[x++], t.image.data[x++]]
      if (t.distance > distance(t.avg, p)) {
          t.mask[i][j] = null;
          if (i + 1 < w && t.mask[i + 1][j]) {
              t.doPoint(i + 1, j)
          }
          if (i - 1 > 0 && t.mask[i - 1][j]) {
              t.doPoint(i - 1, j)
          }
          if (j + 1 < h && t.mask[i][j + 1]) {
              t.doPoint(i, j + 1)
          }
          if (j - 1 > 0 && t.mask[i][j - 1]) {
              t.doPoint(i, j - 1)
          }
      }
      return;
  },
  avgPt: function(i, j, ct) {
      var t = this;
      var w = t.srcimg[0].width;
      var h = t.srcimg[0].height;
      if (i > 0 && j > 0 && i < w && j < h) {
          var x = 4 * (i + (j * w));
          var p = [t.image.data[x++], t.image.data[x++], t.image.data[x++], t.image.data[x++]]
          for (var k = 0; k < 4; k++) {
              t.avg[k] = ((t.avg[k] * ct) + p[k]) / (ct + 1);
          }
      }
  },
  avgct: 0,
  ctx: 0,
  mask: 0,
  image: 0,
  avg: 0,
  srcimg: 0,
  cnv: 0,
  distance: 35,
  container: 0 // container
} // proto

function distance(a, b) {
  var o = 0;
  for (i = 0; i < 4; i++) {
      o += (a[i] - b[i]) * (a[i] - b[i]);
  }
  return (Math.sqrt(o));
}
