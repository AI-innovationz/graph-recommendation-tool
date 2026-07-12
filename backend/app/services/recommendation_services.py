
    
from app.knowledge.graph_data import graph
from app.knowledge.bfs import bfs
from app.api.user_routes import UserRepository
from app.models.request import Request
from app.utils.ratio import getDepthDecay


class Recommendations:

    def __init__(self, user_repo: UserRepository):
        self.user_repository = user_repo
        self.depth_decay_factor = getDepthDecay(graph)

    def get_related_concepts(self, request: Request):

        merged = {}

        for req_type in request.request_type:

            bfs_result = bfs(graph, req_type)

            for concept, info in bfs_result.items():

                if concept not in merged:

                    merged[concept] = {
                        "overall_score": info["score"],
                        "matches": [
                            {
                                "request_node": req_type,
                                "score": info["score"],
                                "path": info["path"],
                                "depth": info["depth"]
                            }
                        ]
                    }

                else:

                    merged[concept]["matches"].append(
                        {
                            "request_node": req_type,
                            "score": info["score"],
                            "path": info["path"],
                            "depth": info["depth"]
                        }
                    )

                    # For now, keep the maximum score.
                    # Later we can replace this with a probabilistic merge.
                    merged[concept]["overall_score"] = max(
                        merged[concept]["overall_score"],
                        info["score"]
                    )

        return merged