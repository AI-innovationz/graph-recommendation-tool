from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import factory functions instead of static router instances
from app.api.user_routes import create_user_router 
from app.api.request_routes import create_req_router
from app.knowledge.data_fetch import DataFetch
from app.knowledge.vector_index import VectorIndex
from app.nlp.embedding_service import EmbeddingService

# Initialize your FastAPI Application
app = FastAPI(
    title="Community Helper Network"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Fetch the graph data once on application startup
df = DataFetch()
em = EmbeddingService()
vi_instance = VectorIndex(em)
graph_instance = df.fetch_data()
vi_instance.build(graph_instance)

# 2. Initialize routers via factory functions, passing the live graph reference
user_router = create_user_router(graph_instance)
req_router = create_req_router(graph_instance,vi_instance)

# 3. Mount the dynamic routers into your application
app.include_router(user_router, prefix="/api/v1")
app.include_router(req_router, prefix="/api/v1")

@app.get("/")
def home():
    return {
        "message": "Community Helper Network"
    }
