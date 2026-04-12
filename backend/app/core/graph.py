from neo4j import GraphDatabase
import os

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

class GraphDB:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    def close(self):
        self.driver.close()

    def create_claim_nodes(self, claim_id, patient_name, doctor_id, hospital_id, agent_id):
        with self.driver.session() as session:
            session.execute_write(self._create_nodes_and_edges, claim_id, patient_name, doctor_id, hospital_id, agent_id)

    @staticmethod
    def _create_nodes_and_edges(tx, claim_id, patient_name, doctor_id, hospital_id, agent_id):
        # Create Patient node
        tx.run("MERGE (p:Patient {name: $name})", name=patient_name)
        # Create Doctor node
        tx.run("MERGE (d:Doctor {id: $id})", id=doctor_id)
        # Create Hospital node
        tx.run("MERGE (h:Hospital {id: $id})", id=hospital_id)
        # Create Agent node
        tx.run("MERGE (a:Agent {id: $id})", id=agent_id)
        # Create Claim node
        tx.run("MERGE (c:Claim {id: $id})", id=claim_id)
        
        # Create Relationships
        tx.run("""
            MATCH (p:Patient {name: $p_name}), (c:Claim {id: $c_id})
            MERGE (c)-[:FILED_BY]->(p)
        """, p_name=patient_name, c_id=claim_id)
        
        tx.run("""
            MATCH (d:Doctor {id: $d_id}), (c:Claim {id: $c_id})
            MERGE (d)-[:TREATED]->(c)
        """, d_id=doctor_id, c_id=claim_id)

        tx.run("""
            MATCH (a:Agent {id: $a_id}), (c:Claim {id: $c_id})
            MERGE (a)-[:PROCESSED]->(c)
        """, a_id=agent_id, c_id=claim_id)

    def run_louvain(self):
        # In a real scenario, we'd use GDS Louvain. 
        # For the demo, we'll return a simulated community score if a doctor is linked to too many flagged claims.
        pass

graph_db = GraphDB()
