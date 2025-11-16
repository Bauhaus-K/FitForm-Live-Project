// --------------------------
// 0. 라이트/다크 테마 토글
// --------------------------
const themeToggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  if (!themeToggleBtn) return;

  if (theme === "light") {
    document.body.classList.add("theme-light");
    themeToggleBtn.textContent = "🌙 Dark";
  } else {
    document.body.classList.remove("theme-light");
    themeToggleBtn.textContent = "☀️ Light";
  }
}

// 초기 테마 적용 (localStorage 기준)
const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme === "light" ? "light" : "dark");

// 버튼 클릭 시 토글
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isLightNext = !document.body.classList.contains("theme-light");
    const nextTheme = isLightNext ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  });
}

// --------------------------
// 1. 기본 상태 & 상수
// --------------------------
const videoEl = document.getElementById("video");
const canvasEl = document.getElementById("canvas");
const ctx = canvasEl.getContext("2d");

const hudExercise = document.getElementById("hud-exercise");
const hudReps = document.getElementById("hud-reps");
const hudAngle = document.getElementById("hud-angle");
const hudFps = document.getElementById("hud-fps");
const hudSet = document.getElementById("hud-set");
const hudRest = document.getElementById("hud-rest");

const statusDot = document.getElementById("status-dot");
const statusLabel = document.getElementById("status-label");
const statusDetail = document.getElementById("status-detail");

const toggleCameraBtn = document.getElementById("toggle-camera");
const toggleOverlayBtn = document.getElementById("toggle-overlay");
const resetBtn = document.getElementById("reset-btn");
const exerciseSelect = document.getElementById("exercise-select");

const countdownOverlay = document.getElementById("countdown-overlay");
const restOverlay = document.getElementById("rest-overlay");
const restOverlayTime = document.getElementById("rest-overlay-time");

const KEY = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16,
};

// --------------------------
// 2. config에서 운동 설정 불러오기
// --------------------------
const RAW_EXERCISES = window.EXERCISE_CONFIG || {};
const WORKOUT_DEFAULTS = window.WORKOUT_DEFAULTS || {
  restDurationSec: 30,
};

const EXERCISES = {};
Object.entries(RAW_EXERCISES).forEach(([key, ex]) => {
  EXERCISES[key] = {
    ...ex,
    angleJoints: ex.angleJoints.map((name) => KEY[name]),
  };
});

// --------------------------
// 3. 상태
// --------------------------
const state = {
  currentKey: "right_curl",
  reps: 0,
  stage: "up",
  lastAngle: 0,
  fps: 0,
  lastFrameTime: performance.now(),
  running: false,
  detector: null,
  animationId: null,
  stream: null,
  showSkeleton: true,
  workoutStarted: false,
  startStableFrames: 0,

  // 세트/휴식/카운트다운
  currentSet: 1,
  totalSets: EXERCISES["right_curl"]?.sets || 3,
  targetRepsPerSet: EXERCISES["right_curl"]?.repsPerSet || 12,
  restDurationSec: WORKOUT_DEFAULTS.restDurationSec || 30,

  inRest: false,
  restRemaining: 0,
  restTimerId: null,

  inCountdown: false,
  countdownValue: 3,
  countdownTimerId: null,
};

// --------------------------
// 4. 도우미 & 스켈레톤
// --------------------------
function toVec2(kp) {
  return [kp.x, kp.y];
}

function angleBetween(a, b, c) {
  const ab = [a[0] - b[0], a[1] - b[1]];
  const cb = [c[0] - b[0], c[1] - b[1]];
  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const magAB = Math.hypot(ab[0], ab[1]);
  const magCB = Math.hypot(cb[0], cb[1]);
  const cosine = dot / (magAB * magCB + 1e-6);
  const rad = Math.acos(Math.min(Math.max(cosine, -1), 1));
  return (rad * 180) / Math.PI;
}

const SKELETON_CONNECTIONS = [
  [KEY.leftShoulder, KEY.rightShoulder],
  [KEY.leftShoulder, KEY.leftElbow],
  [KEY.leftElbow, KEY.leftWrist],
  [KEY.rightShoulder, KEY.rightElbow],
  [KEY.rightElbow, KEY.rightWrist],
  [KEY.leftShoulder, KEY.leftHip],
  [KEY.rightShoulder, KEY.rightHip],
  [KEY.leftHip, KEY.leftKnee],
  [KEY.leftKnee, KEY.leftAnkle],
  [KEY.rightHip, KEY.rightKnee],
  [KEY.rightKnee, KEY.rightAnkle],
];

function projectToCanvas(kp) {
  const nx = kp.x / videoEl.videoWidth;
  const ny = kp.y / videoEl.videoHeight;
  return {
    x: nx * canvasEl.width,
    y: ny * canvasEl.height,
  };
}

function drawSkeleton(keypoints) {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  if (!state.showSkeleton) return;

  keypoints.forEach((kp) => {
    if (!kp) return;
    if (kp.score < 0.3) return;

    const { x, y } = projectToCanvas(kp);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
  });

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
  SKELETON_CONNECTIONS.forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];
    if (!kp1 || !kp2) return;
    if (kp1.score < 0.3 || kp2.score < 0.3) return;

    const p1 = projectToCanvas(kp1);
    const p2 = projectToCanvas(kp2);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });
}

// 포즈선 토글
if (toggleOverlayBtn) {
  toggleOverlayBtn.addEventListener("click", () => {
    state.showSkeleton = !state.showSkeleton;
    toggleOverlayBtn.textContent = state.showSkeleton
      ? "포즈선 끄기"
      : "포즈선 켜기";
    if (!state.showSkeleton) {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
  });
}

// --------------------------
// 5. 세트/휴식 유틸
// --------------------------
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
}

function startCountdown() {
  state.inCountdown = true;
  state.countdownValue = 3;

  if (state.countdownTimerId) clearInterval(state.countdownTimerId);

  countdownOverlay.classList.remove("hidden");
  countdownOverlay.textContent = state.countdownValue;

  state.countdownTimerId = setInterval(() => {
    state.countdownValue -= 1;

    if (state.countdownValue <= 0) {
      clearInterval(state.countdownTimerId);
      state.countdownTimerId = null;
      state.inCountdown = false;
      countdownOverlay.classList.add("hidden");
    } else {
      countdownOverlay.textContent = state.countdownValue;
    }
  }, 1000);
}

function startRest() {
  state.inRest = true;
  state.restRemaining = state.restDurationSec;

  if (state.restTimerId) clearInterval(state.restTimerId);

  restOverlay.classList.remove("hidden");
  restOverlayTime.textContent = formatTime(state.restRemaining);
  hudRest.textContent = formatTime(state.restRemaining);

  state.restTimerId = setInterval(() => {
    state.restRemaining -= 1;

    if (state.restRemaining <= 0) {
      clearInterval(state.restTimerId);
      state.restTimerId = null;
      state.inRest = false;
      restOverlay.classList.add("hidden");
      hudRest.textContent = "-";

      if (state.currentSet < state.totalSets) {
        state.currentSet += 1;
        state.reps = 0;
        state.stage = "up";
        state.workoutStarted = false;
        state.startStableFrames = 0;
      } else {
        statusLabel.textContent = "Completed";
        statusDetail.textContent = "모든 세트를 완료했습니다. 수고했어요! 🎉";
      }
    } else {
      restOverlayTime.textContent = formatTime(state.restRemaining);
      hudRest.textContent = formatTime(state.restRemaining);
    }
  }, 1000);
}

// --------------------------
// 6. HUD & 리셋
// --------------------------
function updateHUD(angle, feedback) {
  hudReps.textContent = state.reps;
  hudAngle.textContent = `${Math.round(angle)}°`;
  hudFps.textContent = state.fps.toFixed(0);

  statusLabel.textContent = feedback.label;
  statusDetail.textContent = feedback.detail;
  statusDot.classList.remove("good", "bad");
  if (feedback.good) statusDot.classList.add("good");
  else statusDot.classList.add("bad");

  hudSet.textContent = `${state.currentSet} / ${state.totalSets}`;
  if (state.inRest) {
    hudRest.textContent = formatTime(state.restRemaining);
  } else if (state.restRemaining === 0) {
    hudRest.textContent = "-";
  }
}

function resetCounter() {
  state.reps = 0;
  state.stage = "up";
  state.lastAngle = 0;
  state.workoutStarted = false;
  state.startStableFrames = 0;

  state.currentSet = 1;
  state.inRest = false;
  state.restRemaining = 0;

  if (state.restTimerId) {
    clearInterval(state.restTimerId);
    state.restTimerId = null;
  }

  restOverlay.classList.add("hidden");
  hudSet.textContent = `${state.currentSet} / ${state.totalSets}`;
  hudRest.textContent = "-";

  statusLabel.textContent = "-";
  statusDetail.textContent = "";
  statusDot.classList.remove("good", "bad");

  hudReps.textContent = "0";
  hudAngle.textContent = "0°";
}

// --------------------------
// 7. 카운팅 & MoveNet
// --------------------------
function updateRepsForExercise(ex, angle) {
  const { up, down } = ex.thresholds;
  if (angle > up) {
    state.stage = "up";
  }
  if (angle < down && state.stage === "up") {
    state.stage = "down";
    state.reps += 1;

    if (
      state.reps >= state.targetRepsPerSet &&
      !state.inRest &&
      state.currentSet <= state.totalSets
    ) {
      startRest();
    }
  }
}

async function createDetector() {
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };
  return poseDetection.createDetector(model, detectorConfig);
}

// --------------------------
// 8. 메인 루프
// --------------------------
async function renderLoop() {
  if (!state.detector || !state.running) return;

  const now = performance.now();
  const dt = now - state.lastFrameTime;
  state.lastFrameTime = now;
  state.fps = 1000 / dt;

  const poses = await state.detector.estimatePoses(videoEl, {
    maxPoses: 1,
    flipHorizontal: true,
  });

  if (poses.length > 0) {
    const kp = poses[0].keypoints;
    const ex = EXERCISES[state.currentKey];
    if (!ex) {
      state.animationId = requestAnimationFrame(renderLoop);
      return;
    }

    const [ia, ib, ic] = ex.angleJoints;
    const a = toVec2(kp[ia]);
    const b = toVec2(kp[ib]);
    const c = toVec2(kp[ic]);

    const angle = angleBetween(a, b, c);
    state.lastAngle = angle;

    if (state.inRest) {
      drawSkeleton(kp);
      const fb = {
        label: "Rest",
        detail: "휴식 중입니다. 다음 세트를 준비하세요.",
        good: true,
      };
      updateHUD(angle, fb);
    } else if (state.inCountdown) {
      drawSkeleton(kp);
      const fb = {
        label: "Get Ready",
        detail: "곧 시작합니다. 준비 자세를 맞춰 주세요.",
        good: true,
      };
      updateHUD(angle, fb);
    } else {
      if (!state.workoutStarted) {
        let ok = false;
        if (ex.start && typeof ex.start.check === "function") {
          ok = ex.start.check(angle, kp);
        } else {
          ok = angle > ex.thresholds.up - 5;
        }

        if (ok) state.startStableFrames += 1;
        else state.startStableFrames = 0;

        if (state.startStableFrames >= 8) {
          state.workoutStarted = true;
          state.reps = 0;
          state.stage = "up";
        }

        drawSkeleton(kp);
        const fb = {
          label: ok ? "Hold start position" : "Set start position",
          detail:
            ex.start?.hint ||
            "준비자세를 맞춰 주세요. (정면을 보고 화면 중앙에 서세요.)",
          good: ok,
        };
        updateHUD(angle, fb);
      } else {
        updateRepsForExercise(ex, angle);
        const fb = ex.feedback(angle);
        drawSkeleton(kp);
        updateHUD(angle, fb);
      }
    }
  } else {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    statusLabel.textContent = "No pose";
    statusDetail.textContent = "사람이 화면 안에 있도록 위치를 조정하세요.";
    statusDot.classList.remove("good", "bad");
  }

  state.animationId = requestAnimationFrame(renderLoop);
}

// --------------------------
// 9. 카메라 시작/정지
// --------------------------
async function startCamera() {
  if (state.running) return;
  try {
    toggleCameraBtn.disabled = true;
    toggleCameraBtn.textContent = "카메라 준비 중...";

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    });
    state.stream = stream;
    videoEl.srcObject = stream;

    await videoEl.play();

    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;

    if (!state.detector) {
      state.detector = await createDetector();
    }

    state.running = true;
    state.lastFrameTime = performance.now();
    toggleCameraBtn.textContent = "카메라 정지";
    toggleCameraBtn.disabled = false;

    startCountdown();
    renderLoop();
  } catch (err) {
    console.error(err);
    alert("카메라 접근 중 오류가 발생했습니다. 브라우저 권한을 확인하세요.");
    toggleCameraBtn.textContent = "카메라 시작";
    toggleCameraBtn.disabled = false;
  }
}

function stopCamera() {
  state.running = false;
  if (state.animationId) cancelAnimationFrame(state.animationId);
  if (state.stream) {
    state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
  }

  if (state.restTimerId) {
    clearInterval(state.restTimerId);
    state.restTimerId = null;
  }
  if (state.countdownTimerId) {
    clearInterval(state.countdownTimerId);
    state.countdownTimerId = null;
  }
  state.inRest = false;
  state.inCountdown = false;
  restOverlay.classList.add("hidden");
  countdownOverlay.classList.add("hidden");
  hudRest.textContent = "-";

  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  toggleCameraBtn.textContent = "카메라 시작";
}

// --------------------------
// 10. 이벤트 바인딩
// --------------------------
if (toggleCameraBtn) {
  toggleCameraBtn.addEventListener("click", () => {
    if (!state.running) startCamera();
    else stopCamera();
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    resetCounter();
  });
}

if (exerciseSelect) {
  exerciseSelect.addEventListener("change", (e) => {
    const key = e.target.value;
    state.currentKey = key;
    const ex = EXERCISES[key];

    if (ex) {
      state.totalSets = ex.sets ?? state.totalSets;
      state.targetRepsPerPerSet = ex.repsPerSet ?? state.targetRepsPerSet;
      // 오타 수정: 위 줄에서 잘못된 필드명 사용 방지를 위해 아래 줄에서 확실히 세팅
      state.targetRepsPerSet = ex.repsPerSet ?? state.targetRepsPerSet;

      resetCounter();
      hudExercise.textContent = ex.name;
      statusLabel.textContent = "Set start position";
      statusDetail.textContent = ex.start?.hint || "준비자세를 맞춰 주세요.";
    }
  });
}

// --------------------------
// 11. 초기 HUD 세팅
// --------------------------
if (EXERCISES[state.currentKey]) {
  hudExercise.textContent = EXERCISES[state.currentKey].name;
}
hudSet.textContent = `${state.currentSet} / ${state.totalSets}`;
hudRest.textContent = "-";
