from collections import deque
from app.nlp.embedding_service import EmbeddingService
import heapq
import math
em = EmbeddingService()
from app.knowledge.config import K
from app.knowledge.config import a
def bfs(graph, start_items):
    # enc = em.encode(start.lower())
    # visited = set()
    max_wt = 0
    semantic_cache = {}
    queue = []

    for start in start_items:
        for source,neighbours in graph.graph.items():
            print(str(start),"start-------")
            similarity_score = em.similarity(str(start),source)
            semantic_cache[source] = similarity_score
            if similarity_score>=0.6:
                queue.append([-similarity_score,source,[source],0,0])
        # for weight, destination, relation in neighbours:    
 
   
    # queue = deque(sorted(starting_nodes,itemgetter=(4),reverse=True))
    heapq.heapify(queue)
    recommendations = {}
    
    while queue:

        score,node,path, depth,parent_score = heapq.heappop(queue)
        score = -score
        # print(score,node,parent_score,"weight---")
        # if node in visited:
        #     continue

        # visited.add(node)
        if parent_score:

            final_score = score*parent_score*pow(a,depth)
        else:
             final_score = score

        # final_score = score
        
        if node not in recommendations:
            recommendations[node] = {
                "score": final_score,
                "path": path,
                "depth": depth
            }
            # max_wt = max(max_wt,final_score)
        else:
            old_score = recommendations[node]["score"]
            combined_score = old_score+final_score
            recommendations[node]={
                "score":combined_score,
                "path":path,
                "depth":depth
            }
            # max_wt = max(max_wt,combined_score)
        for weight, destination, relation in graph.get_neighbours(node):

            new_score = weight
            if destination.lower() in path:
                continue
            else:
                new_path = path + [destination.lower()]

            heapq.heappush(queue,
                [
                    new_score,
                    destination.lower(),
                    new_path,
                    depth + 1,
                    final_score
                ]
            )

    for nodes,recommendation in recommendations.items():
        if semantic_cache[recommendation["path"][len(recommendation["path"])-1]]>0.6:
            recommendation["score"] = recommendation["score"]*0.5 + semantic_cache[recommendation["path"][len(recommendation["path"])-1]]*0.5
            max_wt = max(max_wt,recommendation["score"])

    normalizing_factor = 0
    if max_wt>1:
        normalizing_factor = max_wt - 1
    top_recommendations = []
    heapq.heapify(top_recommendations)
    count =0
    # print(recommendations)
    print(max_wt,normalizing_factor,"factor----")
    for nodes,recommendation in recommendations.items():
        if semantic_cache[recommendation["path"][len(recommendation["path"])-1]]>0.6:
            heapq.heappush(top_recommendations,((recommendation["score"]-normalizing_factor),nodes,recommendation["path"],recommendation["depth"]))
            count+=1
        if count>K:
            heapq.heappop(top_recommendations)
            count-=1



    # print(top_recommendations) 
    return top_recommendations