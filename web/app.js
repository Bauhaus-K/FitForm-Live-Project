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
const statusDot = document.getElementById("status-dot");
const statusLabel = document.getElementById("status-label");
const statusDetail = document.getElementById("status-detail");
const toggleCameraBtn = document.getElementById("toggle-camera");
const toggleOverlayBtn = document.getElementById("toggle-overlay");
const resetBtn = document.getElementById("reset-btn");
const exerciseSelect = document.getElementById("exercise-select");

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
// 2. 운동 설정
// --------------------------
const EXERCISES = {
  right_curl: {
    name: "Right Arm Curl",
    angleJoints: [KEY.rightShoulder, KEY.rightElbow, KEY.rightWrist],
    thresholds: { up: 155, down: 60 },
    start: {
      hint: "오른팔을 옆으로 내려 완전히 편 상태로 덤벨을 들고 서세요.",
      check(angle) {
        return angle > 150;
      },
    },
    feedback(angle) {
      if (angle > 150) {
        return {
          label: "Ready",
          detail: "팔을 완전히 편 상태에서 시작합니다.",
          good: false,
        };
      }
      if (angle < 70) {
        return {
          label: "Curl",
          detail: "수축 구간입니다. 상완이 흔들리지 않게 천천히 내려가세요.",
          good: true,
        };
      }
      return {
        label: "Moving",
        detail: "좋아요, 일정한 속도로 올렸다 내리세요.",
        good: true,
      };
    },
  },
  left_curl: {
    name: "Left Arm Curl",
    angleJoints: [KEY.leftShoulder, KEY.leftElbow, KEY.leftWrist],
    thresholds: { up: 155, down: 60 },
    start: {
      hint: "왼팔을 옆으로 내려 완전히 편 상태로 덤벨을 들고 서세요.",
      check(angle) {
        return angle > 150;
      },
    },
    feedback(angle) {
      if (angle > 150) {
        return {
          label: "Ready",
          detail: "왼팔을 완전히 편 상태에서 시작합니다.",
          good: false,
        };
      }
      if (angle < 70) {
        return {
          label: "Curl",
          detail: "왼팔 수축 구간입니다. 어깨는 고정하세요.",
          good: true,
        };
      }
      return {
        label: "Moving",
        detail: "좋아요, 리듬을 일정하게 유지하세요.",
        good: true,
      };
    },
  },
  squat: {
    name: "Squat",
    angleJoints: [KEY.leftHip, KEY.leftKnee, KEY.leftAnkle],
    thresholds: { up: 165, down: 100 },
    start: {
      hint: "발을 어깨너비로 벌리고 상체를 세운 상태로 똑바로 서세요.",
      check(angle) {
        return angle > 165;
      },
    },
    feedback(angle) {
      if (angle > 170) {
        return {
          label: "Stand",
          detail: "완전히 서 있는 상태입니다. 준비가 되면 천천히 내려가세요.",
          good: false,
        };
      }
      if (angle < 90) {
        return {
          label: "Too Low",
          detail: "너무 낮아요. 허리/무릎 부담에 주의하세요.",
          good: false,
        };
      }
      if (angle >= 90 && angle <= 110) {
        return {
          label: "Good Depth",
          detail: "좋은 깊이입니다. 가슴은 펴고 코어를 조이세요.",
          good: true,
        };
      }
      return {
        label: "Half Squat",
        detail: "조금 더 내려가면 좋아요.",
        good: false,
      };
    },
  },
  lunge_right: {
    name: "Right Lunge",
    angleJoints: [KEY.rightHip, KEY.rightKnee, KEY.rightAnkle],
    thresholds: { up: 165, down: 95 },
    start: {
      hint: "오른발을 앞으로 내딛고 상체를 세운 상태로 준비하세요.",
      check(angle) {
        return angle > 165;
      },
    },
    feedback(angle) {
      if (angle > 170) {
        return {
          label: "Stand",
          detail: "상체를 세우고 중심을 잡은 뒤 천천히 내려가세요.",
          good: false,
        };
      }
      if (angle < 85) {
        return {
          label: "Too Low",
          detail: "너무 깊습니다. 앞무릎이 발끝을 넘지 않게!",
          good: false,
        };
      }
      if (angle >= 90 && angle <= 110) {
        return {
          label: "Good Lunge",
          detail: "좋아요. 상체는 세우고 코어를 긴장하세요.",
          good: true,
        };
      }
      return {
        label: "Shallow",
        detail: "조금 더 내려가면 좋아요.",
        good: false,
      };
    },
  },
  shoulder_press: {
    name: "Shoulder Press",
    angleJoints: [KEY.rightShoulder, KEY.rightElbow, KEY.rightWrist],
    thresholds: { up: 160, down: 90 },
    start: {
      hint: "덤벨을 귀 옆 정도 높이로 들고, 팔꿈치가 몸 앞에 오도록 유지하세요.",
      check(angle) {
        return angle >= 90 && angle <= 130;
      },
    },
    feedback(angle) {
      if (angle > 155) {
        return {
          label: "Lockout",
          detail: "팔을 완전히 잠그지 말고 살짝 굽혀 주세요.",
          good: false,
        };
      }
      if (angle < 90) {
        return {
          label: "Bottom",
          detail: "어깨 아래로 너무 내리지 않게 주의!",
          good: false,
        };
      }
      return {
        label: "Pressing",
        detail: "천천히 위로 밀어 올리며 코어를 조이세요.",
        good: true,
      };
    },
  },
  side_raise_right: {
    name: "Right Side Raise",
    angleJoints: [KEY.rightElbow, KEY.rightShoulder, KEY.rightHip],
    thresholds: { up: 165, down: 80 },
    start: {
      hint: "오른팔을 몸 옆에 자연스럽게 두고 서세요.",
      check(angle) {
        return angle > 160;
      },
    },
    feedback(angle) {
      if (angle > 165) {
        return {
          label: "Down",
          detail: "팔을 몸 옆에 두고 준비하세요.",
          good: false,
        };
      }
      if (angle < 80) {
        return {
          label: "Too High",
          detail: "어깨 높이까지만 올려 주세요.",
          good: false,
        };
      }
      if (angle >= 80 && angle <= 110) {
        return {
          label: "Good",
          detail: "좋은 높이입니다. 팔꿈치를 살짝 굽혀 주세요.",
          good: true,
        };
      }
      return {
        label: "Raising",
        detail: "어깨 높이까지 천천히 올리세요.",
        good: true,
      };
    },
  },
};

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
};

// --------------------------
// 3. 도우미 & 스켈레톤
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

// MoveNet이 주는 픽셀 좌표를 캔버스 좌표로 매핑
function projectToCanvas(kp) {
  // MoveNet: kp.x, kp.y 는 "비디오 픽셀 기준"
  const nx = kp.x / videoEl.videoWidth;
  const ny = kp.y / videoEl.videoHeight;
  return {
    x: nx * canvasEl.width,
    y: ny * canvasEl.height,
  };
}

function drawSkeleton(keypoints) {
  // 매 프레임 캔버스 싹 지우기
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  // 포즈선 OFF 이면 더 이상 안 그림
  if (!state.showSkeleton) {
    return;
  }

  // 점 그리기
  keypoints.forEach((kp) => {
    if (!kp) return;
    if (kp.score < 0.3) return; // 필요하면 임계값 조정

    const { x, y } = projectToCanvas(kp);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
  });

  // 선 그리기
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

// 포즈선 토글 버튼
toggleOverlayBtn.addEventListener("click", () => {
  state.showSkeleton = !state.showSkeleton;
  toggleOverlayBtn.textContent = state.showSkeleton
    ? "포즈선 끄기"
    : "포즈선 켜기";
  // 토글이 OFF일 때 바로 캔버스 지우기
  if (!state.showSkeleton) {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
});

function updateHUD(angle, feedback) {
  hudReps.textContent = state.reps;
  hudAngle.textContent = `${Math.round(angle)}°`;
  hudFps.textContent = state.fps.toFixed(0);
  statusLabel.textContent = feedback.label;
  statusDetail.textContent = feedback.detail;
  statusDot.classList.remove("good", "bad");
  if (feedback.good) statusDot.classList.add("good");
  else statusDot.classList.add("bad");
}

function resetCounter() {
  state.reps = 0;
  state.stage = "up";
  state.lastAngle = 0;
  state.workoutStarted = false;
  state.startStableFrames = 0;

  statusLabel.textContent = "-";
  statusDetail.textContent = "";
  statusDot.classList.remove("good", "bad");

  hudReps.textContent = "0";
  hudAngle.textContent = "0°";
}

// --------------------------
// 4. 카운팅 & MoveNet
// --------------------------
function updateRepsForExercise(ex, angle) {
  const { up, down } = ex.thresholds;
  if (angle > up) {
    state.stage = "up";
  }
  if (angle < down && state.stage === "up") {
    state.stage = "down";
    state.reps += 1;
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
// 5. 메인 루프
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
    const [ia, ib, ic] = ex.angleJoints;

    const a = toVec2(kp[ia]);
    const b = toVec2(kp[ib]);
    const c = toVec2(kp[ic]);

    const angle = angleBetween(a, b, c);
    state.lastAngle = angle;

    // 시작 자세 캘리브레이션
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
      // 실제 운동 카운트
      updateRepsForExercise(ex, angle);
      const fb = ex.feedback(angle);
      drawSkeleton(kp);
      updateHUD(angle, fb);
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
// 6. 카메라 시작/정지
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
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  toggleCameraBtn.textContent = "카메라 시작";
}

// --------------------------
// 7. 이벤트 바인딩
// --------------------------
toggleCameraBtn.addEventListener("click", () => {
  if (!state.running) startCamera();
  else stopCamera();
});

resetBtn.addEventListener("click", () => {
  resetCounter();
});

exerciseSelect.addEventListener("change", (e) => {
  const key = e.target.value;
  state.currentKey = key;
  resetCounter();

  const ex = EXERCISES[key];
  hudExercise.textContent = ex.name;
  statusLabel.textContent = "Set start position";
  statusDetail.textContent = ex.start?.hint || "준비자세를 맞춰 주세요.";
});

// 초기 HUD
hudExercise.textContent = EXERCISES[state.currentKey].name;
