from app.models.request import Request
from app.models.user import User
from app.models.enum import UserRole,RequestType
from app.api.user_routes import UserRepository
from app.utils.distance import DistanceCalculator
from .recommendation_services import Recommendations
from app.models.recommendation import Recommendation

class MatchingService:
    def __init__(self,user_repository:UserRepository):
        self.user_repository = user_repository
        
     

    def find_best_helper(self, request: Request) -> list[Recommendation]:

        try:
            users = self.user_repository.get_all()
        except Exception as e:
            print(e, "error----")
            return []

        recommendations = Recommendations(self.user_repository)

        related_concepts = recommendations.get_related_concepts(request)
        print(related_concepts,"related concepts in matching service")

        results = []

        sorted_concepts = sorted(
            related_concepts.items(),
            key=lambda x: x[1]["overall_score"],
            reverse=True
        )

        for concept, info in sorted_concepts:

            matched_helpers = []

            for user in users:

                if not user.is_active:
                    continue

                if user.role != UserRole.HELPER:
                    continue

                if any(pref.lower() == concept for pref in user.preference):
                    matched_helpers.append(user)

            if not matched_helpers:
                continue

            # Sort matches so frontend always gets them in descending score
            matches = sorted(
                info["matches"],
                key=lambda x: x["score"],
                reverse=True
            )

            results.append(Recommendation(
            matched_preference=concept.upper(),

            score=info["overall_score"],

            confidence=info["overall_score"],

            matches=matches,

            helpers=matched_helpers
        ))

        return results