import pModel from 'clmtrackr/models/model_pca_20_svm';
import EmotionClassifier from './helpers/emotion_classifier';
import emotionModel from './helpers/emotion_model';
import D3 from './helpers/d3';
import ButtonsState from './helpers/buttons_state';


let startbutton = document.getElementById('startbutton');
let vid = document.getElementById('videoel');
let vidWidth = vid.width;
let vidHeight = vid.height;
let overlay = document.getElementById('overlay');
let overlayCC = overlay.getContext('2d');

const inactiveEmotions = ['disgusted', 'fear'];

/********** check and set up video/webcam **********/
(function onloadChecks() {
  function enablestart() {
    startbutton.value = "start";
    startbutton.disabled = null;
  }

  function adjustVideoProportions() {
    // resize overlay and video if proportions are different
    // keep same height, just change width
    let proportion = vid.videoWidth/vid.videoHeight;
    vidWidth = Math.round(vidHeight * proportion);
    vid.width = vidWidth;
    overlay.width = vidWidth;
  }

  function gumSuccess( stream ) {
    // add camera stream if getUserMedia succeeded
    if ("srcObject" in vid) {
      vid.srcObject = stream;
    } else {
      vid.src = (window.URL && window.URL.createObjectURL(stream));
    }
    vid.onloadedmetadata = function() {
      adjustVideoProportions();
      vid.play();
    };
    vid.onresize = function() {
      adjustVideoProportions();
      ctrack.stop();
      ctrack.reset();
      ctrack.start(vid);
    }
  }

  function gumFail() {
    alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
  }

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

  // check for camerasupport
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
  } else if (navigator.getUserMedia) {
    navigator.getUserMedia({video : true}, gumSuccess, gumFail);
  } else {
    alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
  }

  vid.addEventListener('canplay', enablestart, false);
}());

/*********** setup of emotion detection *************/
let ctrack = (function setupCtrack() {
// set eigenvector 9 and 11 to not be regularized. This is to better detect motion of the eyebrows
  pModel.shapeModel.nonRegularizedVectors.push(9);
  pModel.shapeModel.nonRegularizedVectors.push(11);

// it has major issues when using it via module system. So it's loaded on a page beforehand.
  let ctrack = new clm.tracker({useWebGL : true});
  ctrack.init(pModel);
  return ctrack;
}());

/**
 * Charts for emotions
 */

let ec;
let d3;
let emotionData;

function initEC(removeEmotions = []) {
  let emotionModelCopy = JSON.parse(JSON.stringify(emotionModel));
  for (let emotion of removeEmotions) {
    delete emotionModelCopy[emotion];
  }

  ec = new EmotionClassifier();
  ec.init(emotionModelCopy);
  emotionData = ec.getBlank();

  d3 = new D3("#emotion_chart", emotionData, ec);
}

// it's inited twice because of proper button selector initialization
initEC();

/**
 * Buttons selector
 */
let buttonsState = new ButtonsState(emotionData, inactiveEmotions, function (emotion, activate, emotionsToRemove) {
  initEC(emotionsToRemove);
});

initEC(inactiveEmotions);

(function startVideoButton() {
  function startVideo() {
    // start video
    vid.play();
    // start tracking
    ctrack.start(vid);
    // start loop to draw face
    drawLoop();
  }
  function stopVideo() {
    d3.resetData(ec.getBlank());
    ctrack.stop();
    cancelAnimationFrame(reqAnimFrame);
    overlayCC.clearRect(0, 0, vidWidth, vidHeight);
  }

  let reqAnimFrame;

  function drawLoop() {
    reqAnimFrame = requestAnimationFrame(drawLoop);
    overlayCC.clearRect(0, 0, vidWidth, vidHeight);
    if (ctrack.getCurrentPosition()) {
      ctrack.draw(overlay);
    }
    const cp = ctrack.getCurrentParameters();

    const er = ec.meanPredict(cp);
    if (er) {
      d3.updateData(er);

      let guessed = er.reduce((max, item) => {
        if (!max) {
          return item;
        } else {
          if (item.value > max.value) {
            return item;
          }
        }
        return max;
      }, null);

      if (guessed && guessed.emotion) {
        buttonsState.update(guessed.emotion);
      }
    }
  }

  function onClick() {
    if (startbutton.value === 'start') {
      startbutton.value = 'stop';
      startVideo();
    } else {
      startbutton.value = 'start';
      stopVideo();
    }
  }
  startbutton.addEventListener('click', onClick);
}());