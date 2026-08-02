import numpy as np
from typing import List, Tuple, Optional

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """
    Computes Cosine Similarity between two floating point embedding vectors.
    Returns a value between -1.0 and 1.0 (where 1.0 indicates identical direction).
    """
    arr1 = np.array(v1, dtype=np.float32)
    arr2 = np.array(v2, dtype=np.float32)
    
    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)
    
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
        
    dot_product = np.dot(arr1, arr2)
    similarity = dot_product / (norm1 * norm2)
    return float(np.clip(similarity, -1.0, 1.0))

def find_best_match(
    target_embedding: List[float],
    candidates: List[dict],
    threshold: float = 0.60
) -> Tuple[Optional[dict], float]:
    """
    Compares target_embedding against all candidate records from MongoDB.
    
    :param target_embedding: List of floats representing captured face embedding
    :param candidates: List of dict records from MongoDB containing 'embedding'
    :param threshold: Minimum similarity threshold to accept a match
    :return: (best_candidate_dict or None, highest_similarity_score)
    """
    best_candidate = None
    highest_similarity = -1.0
    
    for candidate in candidates:
        stored_vec = candidate.get("embedding", [])
        if not stored_vec:
            continue
            
        sim = cosine_similarity(target_embedding, stored_vec)
        if sim > highest_similarity:
            highest_similarity = sim
            best_candidate = candidate
            
    if highest_similarity >= threshold and best_candidate is not None:
        return best_candidate, highest_similarity
        
    return None, max(0.0, highest_similarity)
