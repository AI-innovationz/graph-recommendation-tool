from collections import deque
import heapq
import math
import time
from app.nlp.embedding_service import EmbeddingService
from app.knowledge.config import K, a
from app.knowledge.vector_index import VectorIndex

em = EmbeddingService()


def bfs(graph, start_items,vi):
    total_start = time.perf_counter()
    semantic_cache = {}
    queue = []
    final_cache = []
    top_30=[]
    # ---------------------------------------------------------
    # 1. Calculate semantic similarity for every
    #    start item -> graph source
    # ---------------------------------------------------------
    heapq.heapify(top_30)
    t = time.perf_counter()
    for start in start_items:
        semantic_cache[start] = {}
       
        similar_nodes = vi.search(
            str(start),
            k=30
        )
    
        for similarity_score, source in similar_nodes:
            # Keep similarity separately for every start
            semantic_cache[start][source] = similarity_score

            if similarity_score >= 0.6:
                heapq.heappush(top_30,[
                    similarity_score,  # min heap behavior
                    source,
                    [source],
                    0,                  # depth
                    0,                  # parent score
                    start               # original start item
                ])

            while len(top_30)>30:
                heapq.heappop(top_30)

    
    print("FAISS + embedding:", time.perf_counter() - t)
    heapq.heapify(queue)
    queue = []
    
    for score, node, path, depth, parent_score, start in top_30:

        heapq.heappush(
            queue,
            [
                -score,
                node,
                path,
                depth,
                parent_score,
                start
            ]
        )

    recommendations = {}
    max_wt = 0

    # ---------------------------------------------------------
    # 2. Traverse the graph
    # ---------------------------------------------------------
    nodes_processed = 0
    edges_processed = 0
    max_queue_size = 0

    while queue:
        nodes_processed += 1
        max_queue_size = max(max_queue_size, len(queue))
        score, node, path, depth, parent_score, start = heapq.heappop(queue)

        score = -score

        # -----------------------------------------------------
        # Calculate final score
        # -----------------------------------------------------
        if parent_score:
            final_score = score * parent_score * pow(a, depth)
        else:
            final_score = score

        # Ignore weak paths
        if final_score < 0.5:
            continue

        # -----------------------------------------------------
        # Store recommendation
        # -----------------------------------------------------
        if node not in recommendations:

            recommendations[node] = {
                "score": final_score,
                "path": path,
                "depth": depth,
                "start": start
            }

        else:

            old_score = recommendations[node]["score"]

            combined_score = old_score + final_score

            recommendations[node] = {
                "score": combined_score,
                "path": path,
                "depth": depth,
                "start": start
            }

        # -----------------------------------------------------
        # Traverse neighbours
        # -----------------------------------------------------
        for weight, destination, relation in graph.get_neighbours(node):
            edges_processed += 1

            destination = destination.lower()

            # Prevent cycles
            if destination in path:
                continue

            new_path = path + [destination]

            new_score = weight

            heapq.heappush(
                queue,
                [
                    new_score,
                    destination,
                    new_path,
                    depth + 1,
                    final_score,
                    start
                ]
            )

    print("Graph traversal:", time.perf_counter() - t)
    print("Nodes processed:", nodes_processed)
    print("Edges processed:", edges_processed)
    print("Max queue size:", max_queue_size)
    # ---------------------------------------------------------
    # 3. Combine graph score with semantic similarity
    # ---------------------------------------------------------
    t = time.perf_counter()
    for node, recommendation in recommendations.items():

        start = recommendation["start"]
        final_node = recommendation["path"][-1]

        semantic_score = semantic_cache[start].get(final_node, 0)

        if semantic_score > 0.6:

            recommendation["score"] = (
                recommendation["score"] * 0.5
                + semantic_score * 0.5
            )

            max_wt = max(
                max_wt,
                recommendation["score"]
            )

    # ---------------------------------------------------------
    # 4. Normalize scores
    # ---------------------------------------------------------
    normalizing_factor = 0

    if max_wt > 1:
        normalizing_factor = max_wt - 1

    # ---------------------------------------------------------
    # 5. Keep top K recommendations
    # ---------------------------------------------------------
    top_recommendations = []
    heapq.heapify(top_recommendations)

    count = 0

    print(
        max_wt,
        normalizing_factor,
        "factor----"
    )

    for node, recommendation in recommendations.items():

        start = recommendation["start"]
        final_node = recommendation["path"][-1]

        semantic_score = semantic_cache[start].get(final_node)

        if semantic_score is None:
            semantic_score = em.similarity(
                str(start),
                str(final_node)
            )

        if semantic_score > 0.6 and semantic_score<0.95:
            graph.add_edge(start,final_node,'related',recommendation["score"],[])
            final_cache.append({'start':start,'final_node':final_node,'score':recommendation['score']})
            heapq.heappush(
                top_recommendations,
                (
                    recommendation["score"] - normalizing_factor,
                    node,
                    recommendation["path"],
                    recommendation["depth"]
                )
            )

            count += 1

            if count > K:
                heapq.heappop(top_recommendations)
                count -= 1
    print("Final scoring:", time.perf_counter() - t)

    print("TOTAL:", time.perf_counter() - total_start)
    return [top_recommendations,final_cache]