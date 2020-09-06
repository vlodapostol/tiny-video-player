document.addEventListener("DOMContentLoaded", () => {
  var video = document.getElementById("video");

  var canvas = document.getElementById("videoCanvas");
  var context = canvas.getContext("2d");

  var controlsCanvas = document.getElementById("controlsCanvas");
  var controlsContext = controlsCanvas.getContext("2d");

  var videoTitle = document.getElementById("videoTitle");
  videoTitle.innerText = video.src
    .split("media/")
    [video.src.split("media/").length - 1].replace(/(.mp4)/g, "");

  var progressBarCanvas = document.getElementById("progressBarCanvas");
  var progressBarContext = progressBarCanvas.getContext("2d");

  video.addEventListener("loadedmetadata", function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    controlsCanvas.width = 90;
    controlsCanvas.height = 30;
    drawControls(controlsCanvas, controlsContext);

    progressBarCanvas.width = canvas.clientWidth - controlsCanvas.width;
    progressBarCanvas.height = 30;

    //console.log("video resolution:", this.videoWidth, this.videoHeight);
  });

  // canvas.addEventListener("mousemove", e => {
  //   var rect = canvas.getBoundingClientRect();
  //   var x = e.clientX;
  //   var y = e.clientY;
  //   console.log("x: " + x + " y: " + y);
  //   imgData = context.getImageData(x, y, 3, 3);
  //   console.log(
  //     "r:" + imgData.data[0] + " g:" + imgData.data[1] + " b:" + imgData.data[2]
  //   );
  // });

  //histogram - will work only if the browser is launched with the web security disabled
  var chart = new SmoothieChart();
  var delay = 1000;
  chart.streamTo(document.getElementById("histogram"), delay);

  var redLine = new TimeSeries();
  var greenLine = new TimeSeries();
  var blueLine = new TimeSeries();

  var imgData;

  video.addEventListener("ended", () => {
    console.log(imgData.data);
    imgData = [];
    console.log(imgData.data);
  });

  video.addEventListener("play", () => {
    function drawFrame() {
      context.drawImage(video, 0, 0);

      progressBarContext.fillStyle = "#FFFF00";
      progressBarContext.fillRect(
        0,
        0,
        Math.floor(
          (progressBarCanvas.width / video.duration) * video.currentTime
        ),
        30
      );

      progressBarContext.fillStyle = "#000000";
      progressBarContext.font = "20px sans-serif";
      progressBarContext.fillText(
        Math.floor(video.currentTime) + " / " + Math.floor(video.duration),
        10,
        25
      );

      imgData = context.getImageData(0, 0, canvas.width, canvas.height);

      requestAnimationFrame(drawFrame);
    }

    requestAnimationFrame(drawFrame);

    if (imgData !== undefined) {
      setInterval(function() {
        redLine.append(new Date().getTime(), imgData.data[0]);
        greenLine.append(new Date().getTime(), imgData.data[1]);
        blueLine.append(new Date().getTime(), imgData.data[2]);
      }, 1000);
    }
  });

  chart.addTimeSeries(redLine, { strokeStyle: "rgb(255,0,0)" });
  chart.addTimeSeries(greenLine, { strokeStyle: "rgb(0,255,0)" });
  chart.addTimeSeries(blueLine, { strokeStyle: "rgb(0,0,255)" });

  window.onresize = () => {
    drawControls(controlsCanvas, controlsContext);

    progressBarCanvas.width = canvas.clientWidth - controlsCanvas.width;
  };

  controlsCanvas.addEventListener("mousedown", e => {
    const rect = controlsCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log(`x: ${x} y: ${y}`);

    if (x >= 30 && x <= 55) {
      if (!video.paused) {
        video.pause();
      } else {
        video.play();
      }
    }
    if (x >= 0 && x <= 25) {
      previousVideo(video.src);
    }
    if (x >= 60 && x <= 84) {
      nextVideo(video.src);
    }
  });
});

var videosArray = [];
for (let i = 1; i <= 4; i++) {
  var newVideo = {
    src: `media/sample${i}.mp4`
  };
  videosArray.push(newVideo);
}

function changeVideoSource(path) {
  console.log(path);
  var video = document.getElementById("video");
  video.src = path.replace(/(.jpg)/g, ".mp4");
  video.volume = 0.1;
  video.play();

  var videoTitle = document.getElementById("videoTitle");
  videoTitle.innerText = video.src
    .split("media/")
    [video.src.split("media/").length - 1].replace(/(.mp4)/g, "");
}

function nextVideo(currentPath) {
  //console.log(currentPath);
  for (let i = 0; i < videosArray.length; i++) {
    if (currentPath.includes(videosArray[i].src)) {
      if (videosArray[i + 1] !== undefined) {
        changeVideoSource(videosArray[i + 1].src);
      } else {
        alert("There is no next video!");
      }
    }
  }
}

function previousVideo(currentPath) {
  //console.log(currentPath);
  for (let i = 0; i < videosArray.length; i++) {
    if (currentPath.includes(videosArray[i].src)) {
      if (videosArray[i - 1] !== undefined) {
        changeVideoSource(videosArray[i - 1].src);
      } else {
        alert("There is no previous video!");
      }
    }
  }
}

function drawControls(canvas, context) {
  var previousButtonImage = new Image();
  previousButtonImage.src = "./media/previous.png";
  previousButtonImage.onload = () => {
    context.drawImage(previousButtonImage, 0, 4);
  };

  var playButtonImage = new Image();
  playButtonImage.src = "./media/play.png";
  playButtonImage.onload = () => {
    context.drawImage(playButtonImage, 30, 4);
  };

  var nextButtonImage = new Image();
  nextButtonImage.src = "./media/next.png";
  nextButtonImage.onload = () => {
    context.drawImage(nextButtonImage, 60, 4);
  };
}

//screenshot will work only if the browser is launched with the web security disabled
function screenshot() {
  var canvas = document.getElementById("videoCanvas");
  var btnScreenshot = document.getElementById("btnScreenshot");
  var image = new Image();
  image.crossOrigin = "*";
  image.src = canvas.toDataURL("image/png");
  btnScreenshot.href = canvas.toDataURL("image/png");
}

function sepia() {
  var canvas = document.getElementById("videoCanvas");
  canvas.getContext("2d").filter = "sepia(100%)";
}

function blackAndWhite() {
  var canvas = document.getElementById("videoCanvas");
  canvas.getContext("2d").filter = "grayscale(100%)";
}

function invert() {
  var canvas = document.getElementById("videoCanvas");
  canvas.getContext("2d").filter = "invert(100%)";
}

function no_filter() {
  console.log("clear");
  var canvas = document.getElementById("videoCanvas");
  canvas.getContext("2d").filter = "none";
}
