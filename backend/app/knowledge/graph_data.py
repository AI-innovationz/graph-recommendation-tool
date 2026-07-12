from app.knowledge.graph import knowledgeGraph

graph = knowledgeGraph()

graph.add_edge(
    "medicine", 
    "doctor",
    "prescribed_by",
    0.96
)

graph.add_edge(
    "medicine",
    "pharmacy",
    "available_at",
    0.99
)

graph.add_edge(
    "doctor",
    "hospital",
    "works_at",
    0.95
)

graph.add_edge(
    "hospital",
    "ambulance",
    "reachable_by",
    0.98
)

graph.add_edge(
    "hospital",
    "blood donation",
    "may_require",
    0.70
)

graph.add_edge(
    "blood donation",
    "blood bank",
    "fulfilled_by",
    0.98
)



print(graph,"graph logged---")