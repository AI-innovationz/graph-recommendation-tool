from app.models.user import User


class UserRepository:
    def __init__(self):
        self.users: list[User] = []

    def add(self, user: User):
        self.users.append(user)

    def get_all(self) -> list[User]:
        return self.users

    def get_by_id(self, user_id: str) -> User | None:
        for user in self.users:
            if user.id == user_id:
                return user
        return None
    
    