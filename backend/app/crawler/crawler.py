from collections import deque
import os
from wikipedia_api import get_page

visited = set()

queue = deque()


SEEDS = [

"Healthcare",

"Pet care",

"Education",

"Food bank",

"Legal aid",

"Government",

"Disaster relief",

"Electrician",

"Plumber",

"Mental health",

"Veterinary medicine",

"Transportation"

]

for s in SEEDS:
    queue.append(s)



MAX_PAGES = 100

while queue and len(visited) < MAX_PAGES:

    topic = queue.popleft()

    if topic in visited:
        continue

    page = get_page(topic)

    if page is None:
        continue

    visited.add(topic)

    print(f"Downloaded {topic}")

    os.makedirs("data/raw", exist_ok=True)

    with open(
        f"data/raw/{topic.replace('/','_')}.txt",
        "w",
        encoding="utf-8",
    ) as f:

        f.write(page["content"])

    for link in page["links"][:20]:

        if link not in visited:
            queue.append(link)