from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import cv2
import time
import threading
from rtsp_handler import rtsp_streamer

router = APIRouter()

# Global variables
current_id = "Default ID"
current_frame = None
frame_lock = threading.Lock()
frame_timestamp = 0

# Background thread to continuously read frames
def frame_reader_thread(video_path):
    global current_frame, frame_timestamp
    cap = cv2.VideoCapture(video_path)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
            
        with frame_lock:
            current_frame = frame.copy()
            frame_timestamp = time.time()
        
        time.sleep(0.033)  # ~30 FPS

# Start background thread (call this when server starts)
def start_frame_reader(video_path="video.mp4"):
    thread = threading.Thread(target=frame_reader_thread, args=(video_path,), daemon=True)
    thread.start()

def synchronized_cv2_streamer():
    global current_frame
    while True:
        with frame_lock:
            if current_frame is not None:
                frame = current_frame.copy()
            else:
                time.sleep(0.01)
                continue
                
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.033)

def synchronized_interactive_cv2_streamer():
    global current_frame, current_id
    while True:
        with frame_lock:
            if current_frame is not None:
                frame = current_frame.copy()
            else:
                time.sleep(0.01)
                continue
        
        # Add text overlay
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 1
        color = (0, 255, 0)
        thickness = 2
        
        text_size = cv2.getTextSize(current_id, font, font_scale, thickness)[0]
        text_x = (frame.shape[1] - text_size[0]) // 2
        text_y = 50
        
        cv2.putText(frame, current_id, (text_x, text_y), font, font_scale, color, thickness)
        
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.033)

# Pydantic models for JSON request bodies
class UpdateID(BaseModel):
    id: str

class StreamRequest(BaseModel):
    path: str = "video.mp4"

class RTSPStreamRequest(BaseModel):
    rtsp_url: str = "rtsp://10.7.30.50:554/profile2/media.smp"

@router.post("/cv2_stream")
def cv2_stream(request: StreamRequest):
    """Stream video using CV2 with JSON request body - Synchronized"""
    return StreamingResponse(synchronized_cv2_streamer(), media_type="multipart/x-mixed-replace; boundary=frame")

@router.post("/interactive_cv2_stream")
def interactive_cv2_stream(request: StreamRequest):
    """Stream interactive video with overlay using JSON request body - Synchronized"""
    return StreamingResponse(synchronized_interactive_cv2_streamer(), media_type="multipart/x-mixed-replace; boundary=frame")

@router.post("/rtsp_stream")
def rtsp_stream(request: RTSPStreamRequest):
    """Stream RTSP video using JSON request body"""
    return StreamingResponse(rtsp_streamer(request.rtsp_url), media_type="multipart/x-mixed-replace; boundary=frame")

@router.post("/update_id")
def update_id(update_data: UpdateID):
    """Update the overlay ID/title for interactive stream"""
    global current_id
    current_id = update_data.id
    return {"message": f"ID updated to: {current_id}", "id": current_id}

@router.get("/get_id")
def get_id():
    """Get the current overlay ID/title"""
    return {"id": current_id}

# Keep GET endpoints for backward compatibility
@router.get("/cv2_stream")
def cv2_stream_get(path: str = "video.mp4"):
    """Stream video using CV2 (GET endpoint for backward compatibility)"""
    return StreamingResponse(synchronized_cv2_streamer(), media_type="multipart/x-mixed-replace; boundary=frame")

@router.get("/interactive_cv2_stream")
def interactive_cv2_stream_get(path: str = "video.mp4"):
    """Stream interactive video with overlay (GET endpoint for backward compatibility)"""
    return StreamingResponse(synchronized_interactive_cv2_streamer(), media_type="multipart/x-mixed-replace; boundary=frame")

@router.get("/rtsp_stream")
def rtsp_stream_get(rtsp_url: str = "rtsp://10.7.30.50:554/profile2/media.smp"):
    """Stream RTSP video (GET endpoint for backward compatibility)"""
    return StreamingResponse(rtsp_streamer(rtsp_url), media_type="multipart/x-mixed-replace; boundary=frame")
