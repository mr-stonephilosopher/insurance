from neo4j import GraphDatabase
from typing import List, Dict, Any, Optional
import os
import logging

logger = logging.getLogger(__name__)

class Neo4jClient:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None
        
    def connect(self):
        if not self.driver:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
        return self.driver
    
    def close(self):
        if self.driver:
            self.driver.close()
    
    def create_claim_nodes_and_relationships(self, claim_data: Dict[str, Any]) -> bool:
        """Create nodes and relationships for a new claim"""
        try:
            with self.connect().session() as session:
                # Create main entities if they don't exist
                query = """
                MERGE (p:Policyholder {id: $policyholder_id, name: $patient_name})
                MERGE (c:Claim {id: $claim_id})
                SET c.amount = $total_amount, c.date = $timestamp, c.status = $status
                MERGE (p)-[:FILED_CLAIM]->(c)
                """
                
                session.run(query, {
                    'policyholder_id': claim_data.get('policyholder_id'),
                    'patient_name': claim_data.get('patient_name'),
                    'claim_id': claim_data.get('claim_id'),
                    'total_amount': claim_data.get('total_amount'),
                    'timestamp': claim_data.get('timestamp'),
                    'status': claim_data.get('status', 'pending')
                })
                
                # Create hospital and doctor relationships for B2B claims
                if claim_data.get('hospital_id'):
                    query = """
                    MERGE (h:Hospital {id: $hospital_id})
                    MERGE (c:Claim {id: $claim_id})
                    MERGE (h)-[:PROCESSED]->(c)
                    """
                    session.run(query, {
                        'hospital_id': claim_data.get('hospital_id'),
                        'claim_id': claim_data.get('claim_id')
                    })
                
                if claim_data.get('attending_doctor_id'):
                    query = """
                    MERGE (d:Doctor {id: $attending_doctor_id})
                    MERGE (c:Claim {id: $claim_id})
                    MERGE (d)-[:TREATED]->(c)
                    """
                    session.run(query, {
                        'attending_doctor_id': claim_data.get('attending_doctor_id'),
                        'claim_id': claim_data.get('claim_id')
                    })
                
                return True
        except Exception as e:
            logger.error(f"Error creating Neo4j nodes: {e}")
            return False
    
    def detect_fraud_rings_louvain(self) -> List[Dict[str, Any]]:
        """Use Louvain algorithm to detect fraud rings"""
        try:
            with self.connect().session() as session:
                # Run Louvain community detection
                query = """
                CALL gds.louvain.stream({
                    nodeProjection: ['Policyholder', 'Doctor', 'Hospital', 'Agent'],
                    relationshipProjection: {
                        FILED_CLAIM: {orientation: 'UNDIRECTED'},
                        TREATED: {orientation: 'UNDIRECTED'},
                        PROCESSED: {orientation: 'UNDIRECTED'},
                        FILED_FOR: {orientation: 'UNDIRECTED'}
                    }
                })
                YIELD nodeId, communityId
                RETURN gds.util.asNode(nodeId).id AS entity_id, 
                       gds.util.asNode(nodeId) AS entity,
                       communityId AS cluster_id
                """
                
                result = session.run(query)
                clusters = {}
                for record in result:
                    cluster_id = record['cluster_id']
                    entity_id = record['entity_id']
                    entity = record['entity']
                    
                    if cluster_id not in clusters:
                        clusters[cluster_id] = {
                            'cluster_id': str(cluster_id),
                            'entities': [],
                            'entity_types': set()
                        }
                    
                    clusters[cluster_id]['entities'].append(entity_id)
                    clusters[cluster_id]['entity_types'].add(list(entity.labels)[0])
                
                # Analyze clusters for fraud patterns
                fraud_rings = []
                for cluster_id, cluster_data in clusters.items():
                    # Flag as potential fraud ring if:
                    # 1. Multiple entities of same type are connected
                    # 2. High claim volume
                    # 3. Suspicious claim patterns
                    
                    entity_count = len(cluster_data['entities'])
                    entity_types = cluster_data['entity_types']
                    
                    # Get claim statistics for this cluster
                    claims_query = """
                    MATCH (e)-[:FILED_CLAIM|:TREATED|:PROCESSED]->(c:Claim)
                    WHERE e.id IN $entity_ids
                    RETURN count(c) AS claim_count, sum(c.amount) AS total_amount
                    """
                    
                    claims_result = session.run(claims_query, {'entity_ids': cluster_data['entities']})
                    claims_stats = claims_result.single()
                    
                    claim_count = claims_stats['claim_count'] if claims_stats else 0
                    total_amount = claims_stats['total_amount'] if claims_stats else 0
                    
                    # Fraud ring detection logic
                    is_fraud_ring = (
                        entity_count >= 3 and  # Multiple connected entities
                        claim_count >= 5 and   # Multiple claims
                        len(entity_types) >= 2  # Multiple entity types
                    )
                    
                    fraud_rings.append({
                        'cluster_id': cluster_id,
                        'entities': cluster_data['entities'],
                        'entity_types': list(entity_types),
                        'claim_count': claim_count,
                        'total_amount': float(total_amount) if total_amount else 0,
                        'is_fraud_ring': is_fraud_ring,
                        'risk_score': min(100, (entity_count * 10) + (claim_count * 5))
                    })
                
                return fraud_rings
                
        except Exception as e:
            logger.error(f"Error in Louvain fraud detection: {e}")
            return []
    
    def get_entity_connections(self, entity_id: str) -> Dict[str, Any]:
        """Get all connections for a specific entity"""
        try:
            with self.connect().session() as session:
                query = """
                MATCH (e {id: $entity_id})-[r]-(connected)
                RETURN type(r) AS relationship_type,
                       connected.id AS connected_id,
                       labels(connected) AS connected_labels,
                       properties(r) AS relationship_properties
                """
                
                result = session.run(query, {'entity_id': entity_id})
                connections = []
                
                for record in result:
                    connections.append({
                        'relationship_type': record['relationship_type'],
                        'connected_id': record['connected_id'],
                        'connected_labels': record['connected_labels'],
                        'properties': record['relationship_properties']
                    })
                
                return {
                    'entity_id': entity_id,
                    'connections': connections,
                    'connection_count': len(connections)
                }
                
        except Exception as e:
            logger.error(f"Error getting entity connections: {e}")
            return {'entity_id': entity_id, 'connections': [], 'connection_count': 0}
    
    def update_claim_fraud_status(self, claim_id: str, fraud_score: float, cluster_id: Optional[str] = None):
        """Update claim with fraud analysis results"""
        try:
            with self.connect().session() as session:
                query = """
                MATCH (c:Claim {id: $claim_id})
                SET c.fraud_score = $fraud_score,
                    c.analysis_timestamp = datetime(),
                    c.cluster_id = $cluster_id
                """
                
                session.run(query, {
                    'claim_id': claim_id,
                    'fraud_score': fraud_score,
                    'cluster_id': cluster_id
                })
                
                return True
        except Exception as e:
            logger.error(f"Error updating claim fraud status: {e}")
            return False

# Global Neo4j client instance
neo4j_client = Neo4jClient()
