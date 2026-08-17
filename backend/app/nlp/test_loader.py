from loader import Loader

loader = Loader()

documents = loader.load()

loader.statistics(documents)

print()

print("First 5 documents")

print("-" * 50)

for i, (title, text) in enumerate(documents.items()):

    print(title)

    print(text[:200])

    print()

    if i == 4:
        break