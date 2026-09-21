from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
print("STARTING APP MAIN", flush=True)
# Import factory functions instead of static router instances...
from app.api.user_routes import create_user_router 
from app.api.request_routes import create_req_router
from app.knowledge.data_fetch import DataFetch
from app.knowledge.vector_index import VectorIndex


# Initialize your FastAPI Application
app = FastAPI(
    title="Community Helper Network"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://happy-mud-069836b10.3.azurestaticapps.net"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("before fetching data")
# 1. Fetch the graph data once on application startup
df = DataFetch()
print("after fetching data")
vi_instance = VectorIndex()
graph_instance = df.fetch_data()
print("after fetching data-------2")
vi_instance.load_from_azure("DefaultEndpointsProtocol=https;AccountName=vectorstorage112233;AccountKey=Z+rnpTn1WueH70KbqlpYdatO/MLPD1ocWbHmbTzHCjPdCRPG1KGhYdI9L6Ch+eP6o4g44CPTYhjo+AStzS18Iw==;EndpointSuffix=core.windows.net","community-helper-index","community-helper")
print("after fetching data--------3")
# 2. Initialize routers via factory functions, passing the live graph reference
user_router = create_user_router(graph_instance,vi_instance)
req_router = create_req_router(graph_instance,vi_instance)

# 3. Mount the dynamic routers into your application
app.include_router(user_router, prefix="/api/v1")
app.include_router(req_router, prefix="/api/v1")

@app.get("/")
def home():
    return {
        "message": "Community Helper Network"
    }
