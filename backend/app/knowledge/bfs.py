from collections import deque


def bfs(graph, start):

    visited = set()

    queue = deque([
        (
            start.lower(),          # current node
            -1.0,                    # accumulated score
            [start.lower()],        # path till current node
            0                       # depth
        )
    ])

    recommendations = {}

    while queue:

        node, score, path, depth = queue.popleft()
        score = -score

        if node in visited:
            continue

        visited.add(node)

        final_score = score * (1 - ((depth + 1) / 10))

        recommendations[node] = {
            "score": final_score,
            "path": path,
            "depth": depth
        }

        for weight, destination, relation in graph.get_neighbours(node):

            new_score = weight

            new_path = path + [destination.lower()]

            queue.append(
                (
                    destination.lower(),
                    new_score,
                    new_path,
                    depth + 1
                )
            )

    return recommendations