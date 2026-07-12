from fastapi import APIRouter
from app.repositories.request_repository import RequestRepository
from app.api.user_routes import user_repo
from app.models.request import Request , RequestStatus , RequestType
from app.models.location import Location
from app.schemas.request_schema import CreateRequest
from app.services.matching_services import MatchingService


req_repo = RequestRepository()


router = APIRouter(
    prefix="/requests",
    tags = ["Requests"]
)

@router.get("/")
def get_requests():

    req = req_repo.get_all()
    if req is None:
        return {
            "message":"Requests not found"
        }
    
    return req

@router.post("/")
def create_request(req:CreateRequest):
    
    print(req)
    
    new_req = Request(
        user_id= req.user_id,
        request_type= req.request_type,
        description= req.description,
        location= Location(
            latitude=req.latitude,
            longitude=req.longitude
        )
    )

    print(new_req,"req-------")
    try:
        req_repo.add(new_req)
        print("request added")   
    except Exception as e:
        print(e)

    return {
        "message":"Req created",
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

@router.post("/{request_id}/match")
def match_request(request_id:str):
    print(user_repo.get_all())
    req = req_repo.get_by_id(request_id)
    print(req)
    matchingService = MatchingService(user_repo)
    print(matchingService)
    helper = matchingService.find_best_helper(req)
    if helper is None:
        return{
            "msg":"No helper found"
        }
    return helper
    