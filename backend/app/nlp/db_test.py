from neo4j import GraphDatabase

URI = "neo4j+ssc://913033d2.databases.neo4j.io"
AUTH = ("913033d2", "OIa0nQr0fPo9MXkKbZ_PMLA6Fey6JLhVfCG2fqw3AeU")

driver = GraphDatabase.driver(URI, auth=AUTH)

records, summary, keys = driver.execute_query("""
SHOW DATABASES
""")

for r in records:
    print(r)

query = """
MATCH (a)-[r]->(b)
RETURN a.name AS source,
       r.type AS relation,
       b.name AS target,
       r.weight AS weight
"""

records, summary, keys = driver.execute_query(
    query,
    database_="913033d2"
)


print(records,"RECORD_---------------")
for record in records:
    print(record["source"])
    print(record["relation"])
    print(record["target"])
    print(record["weight"])
    print("-----------------------")

driver.close()


