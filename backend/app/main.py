
# print("program started")

# from models.user import User
# from models.location import Location
# from models.request import Request,RequestType,RequestStatus
# from repositories.user_repository import UserRepository
# from services.matching_services import MatchingService



# user_repo =UserRepository()


# user = User(
#     name= "Poushali",
#     phone= "9836894759",
#     location=Location(23.67,89.97)
# )


# helper = User(
#     name = "Rahul",
#     phone = "9999999999",
#     location= Location(23.67,89.63)
# )

# helper.become_helper()

# user_repo.add(user)
# user_repo.add(helper)


# request = Request(
#     user_id = user.id,
#     request_type=RequestType.GROCERY,
#     description= "Need Groceries",
#     location= user.location
# )

# matching_service = MatchingService(user_repo)
# matched_helper = matching_service.find_best_helper(request)


# # print(user_repo.get_all())




# if matched_helper:
#     print(f"Helper found: {matched_helper.name}")
# else:
#     print("No helper available")


from fastapi import FastAPI
from app.api.user_routes import router as user_router 
from app.api.request_routes import router as req_router


app = FastAPI(
    title = "Community Helper Network"
)

app.include_router(user_router,prefix="/api/v1")
app.include_router(req_router, prefix="/api/v1")

@app.get("/")

def home():
    return {
        "message":"Community Helper Network"
    }
