// exercise-config.js

// 각 운동 설정
window.EXERCISE_CONFIG = {
  right_curl: {
    name: "Right Arm Curl",
    angleJoints: ["rightShoulder", "rightElbow", "rightWrist"],
    thresholds: { up: 155, down: 60 },
    sets: 5, // 총 세트
    repsPerSet: 12, // 한 세트당 몇 번
    start: {
      hint: "오른팔을 옆으로 내려 완전히 편 상태로 덤벨을 들고 서세요.",
      // angle: 팔꿈치 각도
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
    angleJoints: ["leftShoulder", "leftElbow", "leftWrist"],
    thresholds: { up: 155, down: 60 },
    sets: 3,
    repsPerSet: 12,
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
    angleJoints: ["leftHip", "leftKnee", "leftAnkle"],
    thresholds: { up: 165, down: 100 },
    sets: 4,
    repsPerSet: 15,
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
    angleJoints: ["rightHip", "rightKnee", "rightAnkle"],
    thresholds: { up: 165, down: 95 },
    sets: 3,
    repsPerSet: 10,
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
    angleJoints: ["rightShoulder", "rightElbow", "rightWrist"],
    thresholds: { up: 160, down: 90 },
    sets: 3,
    repsPerSet: 10,
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
    angleJoints: ["rightElbow", "rightShoulder", "rightHip"],
    thresholds: { up: 165, down: 80 },
    sets: 3,
    repsPerSet: 12,
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

// 전체 워크아웃 기본 옵션 (공통)
window.WORKOUT_DEFAULTS = {
  restDurationSec: 30, // 세트 사이 휴식 (초)
};
