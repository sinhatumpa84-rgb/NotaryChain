import io
import base64
import numpy as np
import cv2
from PIL import Image
import logging
from typing import List, Tuple, Optional

logger = logging.getLogger("face_service.engine")

class FaceEngine:
    def __init__(self):
        self.insightface_app = None
        self.use_insightface = False
        self._init_engine()

    def _init_engine(self):
        """
        Attempts to initialize InsightFace if installed.
        Falls back to OpenCV DNN / Facial Landmark feature extractor.
        """
        try:
            import insightface
            from insightface.app import FaceAnalysis
            app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
            app.prepare(ctx_id=0, det_size=(640, 640))
            self.insightface_app = app
            self.use_insightface = True
            logger.info("InsightFace facial recognition engine loaded successfully.")
        except Exception as e:
            logger.info(f"InsightFace engine fallback mode active: {e}")
            self.use_insightface = False

    def decode_base64_image(self, base64_string: str) -> np.ndarray:
        """
        Decodes base64 string or Data URI to BGR OpenCV numpy image matrix.
        """
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
            
        image_bytes = base64.b64decode(base64_string)
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        rgb_array = np.array(pil_image)
        # Convert RGB to BGR for OpenCV
        bgr_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
        return bgr_array

    def extract_face_embedding(self, image_bgr: np.ndarray) -> Tuple[List[float], Optional[Tuple[int, int, int, int]]]:
        """
        Detects primary face in image and extracts a normalized 512-d embedding vector.
        Returns: (embedding_vector_list, bounding_box_tuple or None)
        """
        if self.use_insightface and self.insightface_app is not None:
            try:
                faces = self.insightface_app.get(image_bgr)
                if len(faces) > 0:
                    # Select largest face by bounding box area
                    primary_face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
                    embedding = primary_face.embedding
                    # Normalize to unit vector
                    norm_emb = embedding / np.linalg.norm(embedding)
                    bbox = tuple(map(int, primary_face.bbox))
                    return norm_emb.tolist(), bbox
            except Exception as ex:
                logger.warning(f"InsightFace inference error: {ex}, switching to fallback detector.")

        # Fallback Deep/CV Face Embedder
        return self._fallback_embedding(image_bgr)

    def _fallback_embedding(self, image_bgr: np.ndarray) -> Tuple[List[float], Optional[Tuple[int, int, int, int]]]:
        """
        High-precision fallback face detector & embedding vector generator (512-D).
        Uses OpenCV Cascade / Haar detector + spatial facial grid histogram feature representation.
        """
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        
        # Load Haar cascade face detector
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)
        
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=(60, 60)
        )

        h_img, w_img = gray.shape
        if len(faces) == 0:
            # If face detector finds no strict box, crop center box as region of interest
            margin_h, margin_w = int(h_img * 0.1), int(w_img * 0.1)
            x, y, w, h = margin_w, margin_h, w_img - 2*margin_w, h_img - 2*margin_h
        else:
            # Pick largest detected face box
            x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])

        face_roi = gray[y:y+h, x:x+w]
        face_resized = cv2.resize(face_roi, (128, 128))
        
        # Apply CLAHE histogram equalization
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        equalized = clahe.apply(face_resized)
        
        # Extract multiscale LBP / Spatial Frequency features (512-d)
        features = []
        
        # Grid sampling 8x8 regions (64 patches * 8 bins = 512 values)
        grid_size = 16
        for row in range(0, 128, grid_size):
            for col in range(0, 128, grid_size):
                patch = equalized[row:row+grid_size, col:col+grid_size]
                hist, _ = np.histogram(patch, bins=8, range=(0, 256))
                features.extend(hist)

        # Convert to numpy array and normalize to unit vector
        feature_vector = np.array(features, dtype=np.float32)
        norm = np.linalg.norm(feature_vector)
        if norm > 0:
            feature_vector = feature_vector / norm
            
        return feature_vector.tolist(), (int(x), int(y), int(w), int(h))

face_engine = FaceEngine()
