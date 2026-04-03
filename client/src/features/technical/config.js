export const NUM_QUESTIONS = 10
export const INTERVIEW_DURATION = 20 * 60
export const SCREENSHOT_INTERVAL = 30000
export const VIDEO_BITRATE = 100000

export const FACE_DETECTION_CONFIG = {
  maxNumFaces: 4,
  refineLandmarks: false,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.5
}

export const CAMERA_CONFIG = {
  width: 640,
  height: 480,
  facingMode: 'user'
}

export const FACE_TRACKING_THRESHOLDS = {
  YAW: 0.28,
  PITCH_UP: -0.14,
  PITCH_DOWN: 0.14
}

export const MEDIAPIPE_URLS = {
  CAMERA_UTILS: 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  FACE_MESH: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
  FACE_MESH_FILES: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/'
}
