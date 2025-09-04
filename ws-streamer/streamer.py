
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_router import router, start_frame_reader

app = FastAPI(
    title="Stream API",
    description="API for streaming video content with interactive overlays",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start the frame reader thread for CV2 streaming
start_frame_reader("video.mp4")

# Mount the API router
app.include_router(router, prefix="/api/v1", tags=["streams"])

# Also mount the router at the root for backward compatibility
app.include_router(router, tags=["streams"])

@app.get("/")
def read_root():
    return {
        "message": "Stream API Server", 
        "version": "1.0.0",
        "endpoints": {
            "cv2_stream": "/api/v1/cv2_stream (POST) or /cv2_stream (GET)",
            "interactive_cv2_stream": "/api/v1/interactive_cv2_stream (POST) or /interactive_cv2_stream (GET)",
            "rtsp_stream": "/api/v1/rtsp_stream (POST) or /rtsp_stream (GET)",
            "update_id": "/api/v1/update_id (POST)",
            "get_id": "/api/v1/get_id (GET)"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}