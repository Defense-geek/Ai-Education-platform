from flask import Flask, render_template
from flask_socketio import SocketIO
import base64
import os
from datetime import datetime
import io
from processing import face_recognition_and_audio_from_video
from converter import Converter
import logging
import re

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
socketio = SocketIO(app, 
                    max_http_buffer_size=32 * 1024 * 1024,
                    cors_allowed_origins="*") 

class RecordingSession:
    def __init__(self):
        self.buffer = io.BytesIO()
        self.total_bytes = 0
        self.chunks_received = 0
        self.start_time = datetime.now()
        self.is_active = True

recordings = {}

def get_recording_path():
    base_dir = 'recordings'
    date_dir = datetime.now().strftime('%Y-%m-%d')
    full_path = os.path.join(base_dir, date_dir)
    
    if not os.path.exists(full_path):
        os.makedirs(full_path)
    
    return full_path

def convert_to_mp4(input_data, output_path):
    """Convert input video data directly to MP4 using PythonVideoConverter."""
    try:
        # Create a temporary file to store input data
        temp_dir = os.path.dirname(output_path)
        temp_input = os.path.join(temp_dir, f'temp_input_{os.path.basename(output_path)}.webm')
        
        logger.info(f"Creating temporary file at: {temp_input}")
        
        # Ensure directory exists
        os.makedirs(temp_dir, exist_ok=True)
        
        # Write the input data to temporary file
        with open(temp_input, 'wb') as f:
            f.write(input_data)
        
        logger.info(f"Temporary file created, size: {os.path.getsize(temp_input)} bytes")
        
        # Use PythonVideoConverter for conversion
        
        conv = Converter()
        
        # Convert webm to mp4
        convert = conv.convert(temp_input, output_path, {
            'format': 'mp4',
            'audio': {
                'codec': 'aac',
                'bitrate': '192k',
                'channels': 2
            },
            'video': {
                'codec': 'h264',
                'bitrate': '2000k',
                'fps': 30,
                'preset': 'medium'
            }
        })

        # Start the conversion
        for timecode in convert:
            logger.debug(f"Converting {timecode}/100")

        # Clean up temporary input file
        try:
            if os.path.exists(temp_input):
                os.remove(temp_input)
                logger.info("Temporary file removed successfully")
        except Exception as e:
            logger.warning(f"Failed to remove temporary input file: {str(e)}")
            
        # Verify the MP4 file was created
        if not os.path.exists(output_path):
            raise Exception("MP4 file was not created")
            
        if os.path.getsize(output_path) == 0:
            raise Exception("MP4 file was created but is empty")
            
        logger.info(f"Successfully created MP4 file at: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error converting video: {str(e)}", exc_info=True)
        return False

def clean_base64(data):
    """Clean and validate base64 data."""
    try:
        # Remove data URL prefix if present
        if isinstance(data, str) and data.startswith('data:'):
            data = re.sub(r'^data:.*,', '', data)
        
        # Remove whitespace and newlines
        if isinstance(data, str):
            data = re.sub(r'\s+', '', data)
        
        return data
    except Exception as e:
        logger.error(f"Error cleaning base64 data: {str(e)}")
        return None

def process_chunk(chunk_data):
    """Process chunk data with improved error handling and validation."""
    try:
        if not chunk_data:
            logger.warning("Empty chunk data received")
            return None

        # Clean the base64 data
        cleaned_data = clean_base64(chunk_data)
        if not cleaned_data:
            return None

        # Handle string input (base64)
        if isinstance(cleaned_data, str):
            try:
                # Add padding if needed
                padding_needed = len(cleaned_data) % 4
                if padding_needed:
                    cleaned_data += '=' * (4 - padding_needed)

                # Try standard base64 first
                try:
                    return base64.b64decode(cleaned_data)
                except Exception:
                    # Try URL-safe base64 as fallback
                    return base64.urlsafe_b64decode(cleaned_data)
            except Exception as e:
                logger.error(f"Base64 decoding failed after cleaning: {str(e)}")
                return None

        # Handle binary input
        elif isinstance(chunk_data, bytes):
            return chunk_data
        
        else:
            logger.warning(f"Unsupported chunk data type: {type(chunk_data)}")
            return None

    except Exception as e:
        logger.error(f"Chunk processing error: {str(e)}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('start-recording')
def handle_recording_start(data):
    try:
        session_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        recordings[session_id] = RecordingSession()
        logger.info(f"Started new recording session: {session_id}")
        return {'session_id': session_id}
    except Exception as e:
        logger.error(f"Error starting recording: {str(e)}")
        return {'error': str(e)}

@socketio.on('stream-chunk')
def handle_stream_chunk(data):
    try:
        session_id = data.get('session_id')
        chunk_data = data.get('chunk')
        
        if not session_id or not chunk_data:
            logger.warning("Missing session_id or chunk data")
            return {'error': 'Missing required data'}
            
        session = recordings.get(session_id)
        if not session or not session.is_active:
            logger.warning(f"Invalid or inactive session ID: {session_id}")
            return {'error': 'Invalid session ID'}
            
        decoded_chunk = process_chunk(chunk_data)
        if not decoded_chunk:
            logger.warning(f"Failed to process chunk for session {session_id}")
            return {'error': 'Failed to process chunk'}
        
        # Write chunk to buffer
        session.buffer.write(decoded_chunk)
        session.total_bytes += len(decoded_chunk)
        session.chunks_received += 1
        
        logger.debug(f"Session {session_id}: Chunk {session.chunks_received} received. "
                    f"Size: {len(decoded_chunk)} bytes. Total: {session.total_bytes} bytes")
        
        # Forward chunk for playback
        socketio.emit('playback-chunk', {
            'chunk': chunk_data,
            'chunk_number': session.chunks_received
        }, include_self=False)
        
        return {'status': 'success'}
            
    except Exception as e:
        logger.error(f"Error processing chunk: {str(e)}")
        return {'error': str(e)}

@socketio.on('stop-recording')
def handle_recording_stop(data):
    try:
        session_id = data.get('session_id')
        logger.info(f"Attempting to stop recording for session: {session_id}")

        session = recordings.get(session_id)

        if not session or not session.is_active:
            logger.warning(f"Invalid or inactive session ID: {session_id}")
            return {'status': 'error', 'message': 'Invalid session ID'}

        if session.total_bytes == 0:
            logger.error("No data recorded for session")
            return {'status': 'error', 'message': 'No video data recorded'}

        # Mark session as inactive
        session.is_active = False

        # Get the recording directory and create output filenames
        rec_dir = get_recording_path()
        raw_filename = f'video_{session_id}.webm'
        raw_filepath = os.path.join(rec_dir, raw_filename)
        processed_filename = f'processed_{session_id}.webm'
        processed_filepath = os.path.join(rec_dir, processed_filename)

        # Ensure recording directory exists
        os.makedirs(rec_dir, exist_ok=True)

        # Save the raw buffer content to a file
        session.buffer.seek(0)
        buffer_content = session.buffer.read()
        with open(raw_filepath, 'wb') as raw_file:
            raw_file.write(buffer_content)

        # Process the video using the face recognition and audio analysis function
        trainer_path = r"trainer.yml"
        suspicious_folder = os.path.join(rec_dir, f'suspicious_frames_{session_id}')

        try:
            face_recognition_and_audio_from_video(
                video_path=raw_filepath,
                trainer_path=trainer_path,
                suspicious_fold=suspicious_folder,
                output_video_pa=processed_filepath
            )
            logger.info(f"Video processed successfully: {processed_filepath}")
        except Exception as e:
            logger.error(f"Error during video processing: {str(e)}")
            return {'status': 'error', 'message': f'Error during video processing: {e}'}

        # Get the final file size and duration
        file_size = os.path.getsize(processed_filepath)
        duration = (datetime.now() - session.start_time).total_seconds()

        # Cleanup session
        session.buffer.close()
        del recordings[session_id]

        return {
            'status': 'success',
            'processed_video_path': processed_filepath,
            'suspicious_folder': suspicious_folder,
            'filesize': file_size,
            'duration': duration,
            'chunks': session.chunks_received
        }

    except Exception as e:
        logger.error(f"Error in stop-recording: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@socketio.on('disconnect')
def handle_disconnect():
    try:
        # Properly close all buffers and mark sessions as inactive
        for session in recordings.values():
            session.is_active = False
            session.buffer.close()
        recordings.clear()
        logger.info("Cleaned up all recordings")
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")

if __name__ == '__main__':
    socketio.run(app, debug=True)
