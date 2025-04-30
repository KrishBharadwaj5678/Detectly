const config = {
  cacheModels: true,
  async: true,
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
  face: { enabled: true, detector: { rotation: true } },
  body: { enabled: true },
  hand: { enabled: true },
  gesture: { enabled: true },
  object: { enabled: true },
};

const human = new Human.Human(config);

const inputVideo = document.getElementById('video-id');
const outputCanvas = document.getElementById('canvas-id');
const ctx = outputCanvas.getContext('2d');

// BUTTONS
const faceButton = document.getElementById('faceButton');
const bodyButton = document.getElementById('bodyButton');
const handButton = document.getElementById('handButton');
const gestureButton = document.getElementById('gestureButton');
const objectButton = document.getElementById('objectButton');
const downloadButton = document.getElementById('downloadButton');

// Toggle the button's active/inactive state
function toggleFeature(feature, button) {
  config[feature].enabled = !config[feature].enabled;
  button.textContent = `${feature.charAt(0).toUpperCase() + feature.slice(1)}: ${config[feature].enabled ? 'ON' : 'OFF'}`;
}

faceButton.addEventListener('click', () => toggleFeature('face', faceButton));
bodyButton.addEventListener('click', () => toggleFeature('body', bodyButton));
handButton.addEventListener('click', () => toggleFeature('hand', handButton));
gestureButton.addEventListener('click', () => toggleFeature('gesture', gestureButton));
objectButton.addEventListener('click', () => toggleFeature('object', objectButton));

// Function to capture both the video and canvas as a combined screenshot and trigger a download
function downloadScreenshot() {
  // Create a temporary canvas for combining the video and the current canvas
  const combinedCanvas = document.createElement('canvas');
  const combinedCtx = combinedCanvas.getContext('2d');

  // Set combined canvas size to match the video
  combinedCanvas.width = inputVideo.videoWidth;
  combinedCanvas.height = inputVideo.videoHeight;

  // Draw video frame onto the combined canvas
  combinedCtx.drawImage(inputVideo, 0, 0, combinedCanvas.width, combinedCanvas.height);

  // Draw the content of the output canvas onto the combined canvas
  combinedCtx.drawImage(outputCanvas, 0, 0, combinedCanvas.width, combinedCanvas.height);

  // Create image from the combined canvas and trigger download
  const imageUrl = combinedCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = imageUrl;
  a.download = 'Detectly.png';
  a.click();
}

downloadButton.addEventListener('click', downloadScreenshot);

async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    inputVideo.srcObject = stream;
    await inputVideo.play();
  } catch (error) {
    console.error('Camera access error:', error);
  }
}

async function drawResults() {
  if (inputVideo.readyState >= 2) {
    const results = await human.detect(inputVideo);

    // Resize canvas to match video if needed
    if (outputCanvas.width !== inputVideo.videoWidth || outputCanvas.height !== inputVideo.videoHeight) {
      outputCanvas.width = inputVideo.videoWidth;
      outputCanvas.height = inputVideo.videoHeight;
    }

    // CLEAR canvas every frame
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // ONLY draw features that are enabled
    if (config.face.enabled) {
      human.draw.face(outputCanvas, results.face);
    }
    if (config.body.enabled) {
      human.draw.body(outputCanvas, results.body);
    }
    if (config.hand.enabled) {
      human.draw.hand(outputCanvas, results.hand);
    }
    if (config.gesture.enabled) {
      human.draw.gesture(outputCanvas, results.gesture);
    }
    if (config.object.enabled) {
      human.draw.object(outputCanvas, results.object);
    }
  }

  requestAnimationFrame(drawResults);
}

async function main() {
  await human.load();
  await setupCamera();
  drawResults();
}

main();