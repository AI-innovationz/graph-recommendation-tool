from fastapi import APIRouter
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.models.location import Location
from app.schemas.user_schema import CreateUserRequest
from app.schemas.become_helper_request_schema import BecomeHelperRequest

# Initialize the repository globally or inside the factory function
user_repo = UserRepository()

def create_user_router(graph,vi) -> APIRouter:
    # 1. Initialize the router inside the function scope
    router = APIRouter(
        prefix="/users",
        tags=["Users"]
    )

    # 2. All your routes go inside this factory function
    @router.get("/")
    def get_users():  # Look, clean and parameterless!
        users = user_repo.get_all()
        print(users)
        return {
            "message": "List of users",
            "users": users
        }

    @router.post("/")
    def create_user(user: CreateUserRequest):
        print(user)
        new_user = User(
            name=user.name,
            phone=user.phone,
            location=Location(
                latitude=user.latitude,
                longitude=user.longitude
            )
        )
        print(new_user, "user-------")
        try:
            user_repo.add(new_user, user)
        except Exception as e:
            print(e)

        return {
            "message": "User created",
            "user_id": str(new_user.id)
        }

    @router.get("/{user_id}")
    def get_user(user_id: str):
        user = user_repo.get_by_id(user_id)
        if user is None:
            return {
                "message": "User not found"
            }
        return user

    @router.patch("/{user_id}/become-helper")
    def become_helper(user_id: str, request: BecomeHelperRequest):
        # 3. Fixed: Removed 'graph' from parameters. It is directly accessible here!
        user = user_repo.get_by_id(user_id)
        
        if user is None:
            return {
                "message": "User not found"
            }
            
        user.preferences = request.preferences
        user.become_helper()
        
        # --- You can safely use the graph here ---
        # Example: graph.add_helper_node(user_id, preferences=request.preferences)
        # print(f"Graph successfully accessed inside become_helper: {graph}")
        
        print(user, "user in api")
        pref_list = user_repo.update_user(user,vi)
        pref_list[0] = list(set(pref_list[0]))

        return {
            "message": "Role changed to Helper",
            "pref_list":pref_list
        }

    @router.patch("/{user_id}/activate")
    def activate_user(user_id: str):
        user = user_repo.get_by_id(user_id)
        if user is None:
            return {
                "message": "User not found"
            }
        user.activate()
        return {
            "message": "User activated"
        }

    @router.patch("/{user_id}/deactivate")
    def deactivate_user(user_id: str):
        user = user_repo.get_by_id(user_id)
        if user is None:
            return {
                "message": "User not found"
            }
        user.deactivate()
        return {
            "message": "User deactivated"
        }

    # 4. Return the constructed router to main.py
    return router
