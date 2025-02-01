
import cv2
import mediapipe as mp
import random  # Used to simulate confidence for demonstration
import pyaudio
import numpy as np
from scipy.signal import butter, lfilter
import os
def store_processed_video_and_suspicious_parts(frame, video_writer, is_suspicious, frame_count, suspicious_folder="suspicious_frames"):
    """
    Store the processed frame in the video file and save suspicious frames as images in a separate folder.

    Parameters:
    - frame: The current processed video frame.
    - video_writer: OpenCV VideoWriter object for processed video.
    - is_suspicious: Boolean flag indicating if the current frame is suspicious.
    - frame_count: Current frame count to uniquely name suspicious images.
    - suspicious_folder: Folder where suspicious frames will be stored.
    """
    # Write the frame to the processed video
    video_writer.write(frame)

    # Save suspicious frames as images
    if is_suspicious:
        if not os.path.exists(suspicious_folder):
            os.makedirs(suspicious_folder)
        # Save the frame as an image in the suspicious folder
        image_path = os.path.join(suspicious_folder, f"suspicious_frame_{frame_count:05d}.jpg")
        cv2.imwrite(image_path, frame)
        print(f"Suspicious frame saved: {image_path}")


def butter_highpass(cutoff, fs, order=5):
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype="high", analog=False)
    return b, a

def highpass_filter(data, cutoff=1000, fs=44100, order=5):
    b, a = butter_highpass(cutoff, fs, order=order)
    y = lfilter(b, a, data)
    return y

def face_recognition_and_audio_from_video(video_path, trainer_path,suspicious_fold ,output_video_pa, audio_threshold=0.02, video_res=(640, 480), suspicious_threshold=2):
    """
    Function to perform face recognition, mesh rendering, and audio processing from a video file.

    Parameters:
    - video_path (str): Path to the video file.
    - trainer_path (str): Path to the pre-trained LBPH trainer.yml file.
    - audio_threshold (float): Threshold for detecting audio activity (default 0.02).
    - video_res (tuple): Video resolution (width, height) (default 640x480).
    - suspicious_threshold (int): Frame count threshold for detecting suspicious activity (default 2).
    """

    # Initialize MediaPipe components
    mp_face_detection = mp.solutions.face_detection
    mp_face_mesh = mp.solutions.face_mesh
    mp_drawing = mp.solutions.drawing_utils

    # Load OpenCV's pre-trained LBPH face recognizer
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    recognizer = cv2.face.LBPHFaceRecognizer_create()

    try:
        recognizer.read(trainer_path)
        print("Recognizer loaded successfully.")
    except Exception as e:
        print(f"Error loading recognizer: {e}")
        return

    # Initialize video capture
    video = cv2.VideoCapture(video_path)
    video.set(cv2.CAP_PROP_FRAME_WIDTH, video_res[0])
    video.set(cv2.CAP_PROP_FRAME_HEIGHT, video_res[1])

    if not video.isOpened():
        print(f"Error: Could not open video file '{video_path}'.")
        return

    # Create VideoWriter objects to store processed video
    output_video_path = output_video_pa
    fourcc = cv2.VideoWriter_fourcc(*'VP80')  # Codec for video
    video_writer = cv2.VideoWriter(output_video_path, fourcc, 30, video_res)  # Processed video

    # Create folder to store suspicious frames
    suspicious_folder = suspicious_fold
    if not os.path.exists(suspicious_folder):
        os.makedirs(suspicious_folder)

    # Initialize pyaudio for real-time audio processing
    p = pyaudio.PyAudio()
    chunk = 1024
    rate = 44100
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=rate, input=True, frames_per_buffer=chunk)

    # Define a function to detect audio energy for speaker detection
    def detect_audio_activity():
        try:
            audio_data = np.frombuffer(stream.read(chunk, exception_on_overflow=False), dtype=np.int16)
        except Exception as e:
            print(f"Audio capture error: {e}")
            return 0

        filtered_audio = highpass_filter(audio_data, cutoff=1000, fs=rate)
        energy = np.sqrt(np.mean(filtered_audio**2))
        return energy

    # Process the video frame by frame
    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection, \
         mp_face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1) as face_mesh:

        frame_count = 0
        while True:
            ret, frame = video.read()
            if not ret:
                break  # End of video

            frame_count += 1

            # Convert the frame to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Perform face detection using MediaPipe
            detection_results = face_detection.process(rgb_frame)
            face_mesh_results = face_mesh.process(rgb_frame)

            # Annotate the frame with face detection information
            is_suspicious = False
            if detection_results.detections:
                face_count = len(detection_results.detections)
                cv2.putText(frame, f"Faces Detected: {face_count}", (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                for detection in detection_results.detections:
                    bboxC = detection.location_data.relative_bounding_box
                    ih, iw, _ = frame.shape
                    x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), int(bboxC.width * iw), int(bboxC.height * ih)

                    # Draw the bounding box
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

                    # Extract the face region for recognition
                    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    face_region = gray_frame[y:y+h, x:x+w]

                    # Perform face recognition
                    try:
                        if face_region.size > 0:    

                            label, confidence = recognizer.predict(face_region)
                            if confidence < 50:  # Adjust confidence threshold as needed
                                cv2.putText(frame, f"Unknown Face ({confidence:.2f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                            else:
                                labeled = f"Person {label}"
                                cv2.putText(frame, f"{labeled} ({confidence:.2f})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                    except Exception as e:
                        cv2.putText(frame, "Recognition Error", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

            # Display the face mesh if any landmarks are detected
            if face_mesh_results.multi_face_landmarks:
                for landmarks in face_mesh_results.multi_face_landmarks:
                    mp_drawing.draw_landmarks(frame, landmarks, mp_face_mesh.FACEMESH_TESSELATION,
                                              mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=1, circle_radius=1),
                                              mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=1, circle_radius=1))

            # Process audio activity for the current frame
            audio_energy = detect_audio_activity()
            if audio_energy > audio_threshold * 2:
                audio_status = "Multiple speakers detected!"
                is_suspicious = True
            elif audio_energy > audio_threshold:
                audio_status = "Single speaker detected."
            else:
                audio_status = "Silence or background noise."

            cv2.putText(frame, f"Audio Status: {audio_status}", (30, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

            # Store video and suspicious frames
            store_processed_video_and_suspicious_parts(frame, video_writer, is_suspicious, frame_count, suspicious_folder)

            # Display the frame
            cv2.imshow("Face Recognition and Audio Processing", frame)

            # Break on 'q' key press
            try:
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("User interrupted. Exiting...")
                    break
            except KeyboardInterrupt:
                print("Keyboard interrupt received. Exiting...")
                break


    # Release resources
    stream.stop_stream()
    stream.close()
    p.terminate()
    video.release()
    video_writer.release()
    cv2.destroyAllWindows()

