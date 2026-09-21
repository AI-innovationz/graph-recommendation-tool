from fastapi import APIRouter
from app.repositories.request_repository import RequestRepository
from app.models.request import Request, RequestStatus, RequestType
from app.models.location import Location
from app.schemas.request_schema import CreateRequest
from app.services.matching_services import MatchingService
from app.utils.parseRequest import parse_request
from app.services.recommendation_services import Recommendations
from app.models.recommendation import Recommendation
from app.repositories.user_repository import UserRepository
from app.nlp.graph_builder import GraphBuilder
from app.models.feedback import FeedbackItem,FeedbackObj
from app.models.match import Match
# Initialize repositories globally or within the function scope
req_repo = RequestRepository()


def create_req_router(graph,vi) -> APIRouter:
    # 1. Initialize the router inside the factory function scope
    router = APIRouter(
        prefix="/requests",
        tags=["Requests"]
    )

    # 2. All endpoints are nested inside this scope to inherit the 'graph' variable
    @router.get("")
    def get_requests():
        req = req_repo.get_all()
        if req is None:
            return {
                "message": "Requests not found"
            }
        return req

    @router.post("")
    def create_request(req: CreateRequest):
        print(req)
        req.request_type = parse_request(req.request_type, req.description)
        new_req = Request(
            user_id=req.user_id,
            request_type=req.request_type,
            description=req.description,
            location=Location(
                latitude=req.latitude,
                longitude=req.longitude
            )
        )

        print(new_req, "req-------")
        try:
            req_repo.add(new_req)
            print("request added")   
        except Exception as e:
            print(e)

        return {
            "message": "Req created",
            "request_id": str(new_req.id)
        }

    @router.get("/{request_id}")
    def get_user(request_id: str):
        req = req_repo.get_by_id(request_id)
        if req is None:
            return {
                "message": "Request not found"
            }
        return req

    @router.post("/match")
    def match_request(request:Match):
        print(request.request,"REQUEST IN MATCH----")
        user_repo = UserRepository()
        matchingService = MatchingService(user_repo)
        print(matchingService)
     
        helper = matchingService.find_best_helper(request.request)
        print(helper,"helper---")
        
        for h in helper:
            original_help = matchingService.fetch_original_help_query(h['properties'].name)
            h['properties'].original_help = original_help

        print(helper,original_help,"helper data--") 
        if helper is None:
            return {
                "msg": "No helper found"
            }
        return helper

    @router.post("/{request_id}/recommendations")
    def get_recommendations(request_id):
        req = req_repo.get_by_id(request_id)
        print(req)
        
        # --- You can use the graph here cleanly if needed ---
        # Example: related_nodes = graph.find_neighbors(req.request_type)
        # print(f"Graph safely accessed inside recommendations: {graph}")
        user_repo = UserRepository()
        recommendations = Recommendations(user_repo,graph,vi)
        related_concepts,final_cache = recommendations.get_related_concepts(req)
        
        if related_concepts is None:
            return {
                "msg": "No recommendations found"
            }
        return [related_concepts,final_cache]

    @router.post("/feedback")
    def update_user_feedbak(rec_obj:FeedbackObj):
        updated_list = []
        final_list = rec_obj.feedbackBody
        n = len(final_list)
        
        # 1. Build the complete updated_list first
        for rec in final_list:
            fin_score = rec.score
            if rec.feedback == 1:
                fin_score += (1 / n)
            elif rec.feedback == -1:
                fin_score -= (1 / n)
                
            # Note: Changed from curly braces {} (sets) to tuples () 
            # so the data maintains proper ordering for your database.
            updated_list.append({"source":rec.start, "relationship":"related to","target":rec.final_node,"confidence":fin_score,"context":rec.start+" "+"related to "+ rec.final_node})
            
        # 2. Run the database transaction AFTER the loop completes
        gb = GraphBuilder(vi)
        try:
            gb.build_graph(updated_list)
            return {"Updated": True}
        except Exception as error:
            print(f"Database error: {error}")  # Helpful for your console debugging
            return {"Updated": False}

    # 3. Return the runtime-configured router to main.py
    return router
