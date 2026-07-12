"""
Biometric verification service for face recognition and liveness detection
"""
import face_recognition
import cv2
import numpy as np
from typing import Optional, Tuple, List
import logging
from pathlib import Path
import base64
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)


class BiometricService:
    """Biometric verification service"""
    
    # Face match threshold (lower is stricter)
    FACE_MATCH_THRESHOLD = 0.6
    
    # Liveness detection thresholds
    BLINK_THRESHOLD = 0.2
    MOVEMENT_THRESHOLD = 10.0
    
    @staticmethod
    def encode_face(image_path: str) -> Optional[str]:
        """
        Extract face encoding from image
        
        Args:
            image_path: Path to image file
            
        Returns:
            Base64 encoded face encoding or None if no face found
        """
        try:
            # Load image
            image = face_recognition.load_image_file(image_path)
            
            # Find faces
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                logger.warning(f"No face found in image: {image_path}")
                return None
            
            if len(face_locations) > 1:
                logger.warning(f"Multiple faces found in image: {image_path}")
                # Use the largest face
                face_locations = [max(face_locations, key=lambda loc: (loc[2] - loc[0]) * (loc[1] - loc[3]))]
            
            # Get face encoding
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if not face_encodings:
                logger.warning(f"Could not encode face in image: {image_path}")
                return None
            
            # Convert to base64 for storage
            face_encoding = face_encodings[0]
            encoding_bytes = face_encoding.tobytes()
            encoding_b64 = base64.b64encode(encoding_bytes).decode('utf-8')
            
            return encoding_b64
        except Exception as e:
            logger.error(f"Error encoding face: {str(e)}")
            return None
    
    @staticmethod
    def decode_face_encoding(encoding_b64: str) -> np.ndarray:
        """
        Decode base64 face encoding to numpy array
        
        Args:
            encoding_b64: Base64 encoded face encoding
            
        Returns:
            Numpy array of face encoding
        """
        try:
            encoding_bytes = base64.b64decode(encoding_b64)
            face_encoding = np.frombuffer(encoding_bytes, dtype=np.float64)
            return face_encoding
        except Exception as e:
            logger.error(f"Error decoding face encoding: {str(e)}")
            return np.array([])
    
    @staticmethod
    def compare_faces(
        known_encoding_b64: str,
        unknown_image_path: str,
        tolerance: float = FACE_MATCH_THRESHOLD
    ) -> Tuple[bool, float]:
        """
        Compare face in image with known face encoding
        
        Args:
            known_encoding_b64: Base64 encoded known face
            unknown_image_path: Path to image to verify
            tolerance: Face match tolerance (lower is stricter)
            
        Returns:
            Tuple of (match: bool, distance: float)
        """
        try:
            # Decode known encoding
            known_encoding = BiometricService.decode_face_encoding(known_encoding_b64)
            if known_encoding.size == 0:
                return False, 1.0
            
            # Load and encode unknown image
            image = face_recognition.load_image_file(unknown_image_path)
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                logger.warning("No face found in verification image")
                return False, 1.0
            
            unknown_encodings = face_recognition.face_encodings(image, face_locations)
            
            if not unknown_encodings:
                logger.warning("Could not encode face in verification image")
                return False, 1.0
            
            unknown_encoding = unknown_encodings[0]
            
            # Compare faces
            distances = face_recognition.face_distance([known_encoding], unknown_encoding)
            distance = distances[0]
            
            match = distance <= tolerance
            
            logger.info(f"Face comparison - Match: {match}, Distance: {distance:.4f}")
            return match, float(distance)
        except Exception as e:
            logger.error(f"Error comparing faces: {str(e)}")
            return False, 1.0
    
    @staticmethod
    def detect_liveness(image_path: str) -> Tuple[bool, dict]:
        """
        Detect if image contains a live person (basic implementation)
        
        This is a simplified liveness detection. Production should use:
        - Multiple frame analysis
        - Blink detection
        - Head movement tracking
        - Texture analysis
        - Specialized ML models
        
        Args:
            image_path: Path to image/video frame
            
        Returns:
            Tuple of (is_live: bool, details: dict)
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return False, {"error": "Could not load image"}
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Basic quality checks
            details = {}
            
            # 1. Check brightness
            brightness = np.mean(gray)
            details["brightness"] = float(brightness)
            if brightness < 50 or brightness > 200:
                details["brightness_check"] = "failed"
                return False, details
            details["brightness_check"] = "passed"
            
            # 2. Check blur (Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            details["blur_score"] = float(laplacian_var)
            if laplacian_var < 100:
                details["blur_check"] = "failed"
                return False, details
            details["blur_check"] = "passed"
            
            # 3. Check face detection confidence
            face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            faces = face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
            )
            
            if len(faces) == 0:
                details["face_detection"] = "failed"
                return False, details
            
            if len(faces) > 1:
                details["face_detection"] = "multiple_faces"
                return False, details
            
            details["face_detection"] = "passed"
            details["face_count"] = len(faces)
            
            # 4. Check image dimensions
            height, width = image.shape[:2]
            details["resolution"] = f"{width}x{height}"
            if width < 640 or height < 480:
                details["resolution_check"] = "low_quality"
                return False, details
            details["resolution_check"] = "passed"
            
            # If all checks pass
            details["liveness_passed"] = True
            return True, details
        except Exception as e:
            logger.error(f"Error in liveness detection: {str(e)}")
            return False, {"error": str(e)}
    
    @staticmethod
    async def verify_face_with_liveness(
        known_encoding_b64: str,
        image_path: str
    ) -> dict:
        """
        Complete face verification with liveness check
        
        Args:
            known_encoding_b64: Base64 encoded known face
            image_path: Path to verification image
            
        Returns:
            Dict with verification results
        """
        result = {
            "verified": False,
            "liveness_passed": False,
            "face_match": False,
            "match_score": 0.0,
            "liveness_details": {}
        }
        
        try:
            # Step 1: Liveness detection
            is_live, liveness_details = BiometricService.detect_liveness(image_path)
            result["liveness_passed"] = is_live
            result["liveness_details"] = liveness_details
            
            if not is_live:
                logger.warning("Liveness detection failed")
                return result
            
            # Step 2: Face matching
            match, distance = BiometricService.compare_faces(
                known_encoding_b64,
                image_path
            )
            
            result["face_match"] = match
            result["match_score"] = 1.0 - distance  # Convert distance to similarity score
            result["verified"] = match and is_live
            
            return result
        except Exception as e:
            logger.error(f"Error in face verification with liveness: {str(e)}")
            result["error"] = str(e)
            return result
    
    @staticmethod
    def extract_face_from_document(document_image_path: str, output_path: str) -> bool:
        """
        Extract face from ID document image
        
        Args:
            document_image_path: Path to ID document image
            output_path: Path to save extracted face
            
        Returns:
            Success status
        """
        try:
            # Load image
            image = face_recognition.load_image_file(document_image_path)
            
            # Find faces
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                logger.warning("No face found in document")
                return False
            
            # Get the largest face
            largest_face = max(face_locations, key=lambda loc: (loc[2] - loc[0]) * (loc[1] - loc[3]))
            
            # Extract face region
            top, right, bottom, left = largest_face
            face_image = image[top:bottom, left:right]
            
            # Save extracted face
            pil_image = Image.fromarray(face_image)
            pil_image.save(output_path)
            
            logger.info(f"Face extracted and saved to: {output_path}")
            return True
        except Exception as e:
            logger.error(f"Error extracting face from document: {str(e)}")
            return False
    
    @staticmethod
    def validate_document_photo_quality(image_path: str) -> Tuple[bool, dict]:
        """
        Validate ID document photo quality
        
        Args:
            image_path: Path to document image
            
        Returns:
            Tuple of (is_valid: bool, quality_metrics: dict)
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                return False, {"error": "Could not load image"}
            
            metrics = {}
            
            # Check resolution
            height, width = image.shape[:2]
            metrics["resolution"] = f"{width}x{height}"
            if width < 800 or height < 600:
                metrics["resolution_check"] = "too_low"
                return False, metrics
            
            # Check brightness
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            metrics["brightness"] = float(brightness)
            if brightness < 60 or brightness > 200:
                metrics["brightness_check"] = "out_of_range"
                return False, metrics
            
            # Check blur
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            metrics["sharpness"] = float(laplacian_var)
            if laplacian_var < 150:
                metrics["sharpness_check"] = "too_blurry"
                return False, metrics
            
            # Check if document is present (edge detection)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            metrics["edge_density"] = float(edge_density)
            if edge_density < 0.05:
                metrics["document_detection"] = "not_detected"
                return False, metrics
            
            metrics["quality_check"] = "passed"
            return True, metrics
        except Exception as e:
            logger.error(f"Error validating document quality: {str(e)}")
            return False, {"error": str(e)}
