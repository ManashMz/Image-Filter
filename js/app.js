const CVS = document.querySelector("#cvs");
const cxt = CVS.getContext("2d");

const imgInput = document.getElementById("image");
const BUTTONS = document.querySelectorAll("#button");
const save = document.getElementById("save");

let imgdata;
let image;
let data;
let active;

//running event listener for image input if changed
imgInput.addEventListener("change", (e) => {
  if (e.target.files) {
    //getting files
    console.log(e.target.files);
    //here we get the image file
    let imageFile = e.target.files[0];
    // fileReader
    var fr = new FileReader();
    // convert to url
    fr.readAsDataURL(imageFile);
    // if the image loads sucessfully give me the data
    fr.onloadend = function (e) {
      //image
      image = new Image();
      image.src = e.target.result;
      image.onload = function (e) {
        CVS.width = image.width;
        CVS.height = image.height;
        cxt.drawImage(image, 0, 0);
        //get data
        imgdata = cxt.getImageData(0, 0, image.width, image.height);
      };
    };
  } else {
    CVS.style.display = "none";
  }
});

BUTTONS.forEach((elem) => {
  elem.addEventListener("click", (e) => {
    active = elem.name;
    switch (active) {
      case "remove-filters":
        nofilter();
        break;
      case "grayscale":
        grayscale();
        break;
      case "blackwhite":
        blackWhite();
        break;
      case "warm":
        warm();
        break;
      case "cool":
        cool();
        break;
      case "sharpen":
        sharpen(CVS.width, CVS.height, 0.5);
        break;
      case "vignette":
        vignette();
        break;
      case "soft":
        soft();
        break;
      case "faded":
        faded();
        break;
      case "classic":
        classic();
        break;
      case "start":
        start();
        break;
      case "frost":
        frost();
        break;
      case "blossom":
        blossom();
        break;
      case "ivory":
        ivory();
        break;
      case "kissme":
        kissme();
        break;
      default:
        break;
    }
  });
});

//downloading the image
function download() {
  let url = CVS.toDataURL("image/png", 1.0).replace(
    "image/png",
    "image/octet-stream"
  );
  let link = document.createElement("a");
  link.download = "image.png";
  link.href = url;
  link.click();
}

save.addEventListener("click", download);
