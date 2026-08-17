from fastapi import APIRouter
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.models.location import Location
from app.schemas.user_schema import CreateUserRequest
from app.schemas.become_helper_request_schema import BecomeHelperRequest

user_repo = UserRepository()

router = APIRouter(
    prefix="/users",
    tags = ["Users"]
)

@router.get("/")
def get_users():
    
    users = user_repo.get_all()
    print(users)
    
    return {
        "message":"List of users",
        "users":users
    }

@router.post("/")
def create_user(user:CreateUserRequest):
    
    print(user)
    
    new_user = User(

        name=user.name,
        phone=user.phone,
        location=Location(
            latitude=user.latitude,
            longitude=user.longitude
        )
    )

    print(new_user,"user-------")
    try:
        user_repo.add(new_user,user)
    except Exception as e:
        print(e)

    return {
        "message":"User created",
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
def become_helper(user_id: str,request:BecomeHelperRequest):

    user = user_repo.get_by_id(user_id)

    if user is None:
        return {
            "message": "User not found"
        }

    user.become_helper()
    user.helper_add_pref(request.preferences)
    user_repo.update_user(user)

    return {
        "message": "Role changed to Helper"
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