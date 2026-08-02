# NotaryChain AI Face Recognition Service

A production-ready Python FastAPI microservice that provides AI-based Face Recognition & Verification using InsightFace/OpenCV embeddings, Cosine Similarity matching, and MongoDB vector storage.

---

## 🌟 Key Features

1. **InsightFace / Deep Embedding Engine**:
   - Detects faces and extracts normalized 512-dimensional feature embedding vectors.
   - Falls back gracefully to OpenCV DNN / Spatial Histogram embedder if InsightFace is unavailable.

2. **MongoDB Atlas Storage**:
   - Stores User ID, Name, Vector Embedding, and Registration Timestamp.
   - Only stores public image URLs (optional), never raw image binaries.

3. **Cosine Similarity Matcher**:
   - Compares webcam face embedding with all registered vectors in MongoDB using:
     $$\text{Cosine Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$
   - Returns match result if similarity score $\ge 0.60$ (configurable); otherwise returns `"Unknown Person"`.

4. **REST API Endpoints**:
   - `GET /health`: Service health check.
   - `POST /api/v1/register`: Registers face template for a user.
   - `POST /api/v1/recognize`: Authenticates user from webcam face image.
   - `GET /api/v1/users/{user_id}`: Checks face registration status.
   - `DELETE /api/v1/users/{user_id}`: Deletes face profile.

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd face_service
pip install -r requirements.txt
```

### 2. Start Service
```bash
python main.py
```
Or with Uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. API Documentation
Once running, open your browser:
- Swagger Interactive UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc Docs: [http://localhost:8000/redoc](http://localhost:8000/redoc)
