from app.core.graph import Graph
from app.core.entities import Ambulance, Hospital, Patient
from typing import Optional


class RoutePlanner:
    def __init__(self):
        self.graph = Graph()
        # Stores GPS coordinates for each node id
        self.node_coordinates: dict[str, tuple[float, float]] = {}
        self._build_city_graph()

    def _build_city_graph(self):
        # In a real system this would load from a map API like OpenStreetMap.
        # For our project we simulate a city grid with real Patna coordinates.
        # Each node is an intersection, each edge is a road with distance in km.

        locations = {
            "patna_junction":     (25.6093, 85.1376),
            "pmch_hospital":      (25.6137, 85.1446),
            "gandhi_maidan":      (25.6122, 85.1315),
            "boring_road":        (25.5941, 85.1300),
            "kankarbagh":         (25.5900, 85.1500),
            "rajendra_nagar":     (25.6000, 85.1200),
            "danapur":            (25.6200, 85.0400),
            "bailey_road":        (25.6300, 85.1100),
            "ashok_rajpath":      (25.6050, 85.1550),
            "frazer_road":        (25.6180, 85.1400),
        }

        # Register all locations as graph nodes
        for node_id, (lat, lon) in locations.items():
            self.graph.add_node(node_id)
            self.node_coordinates[node_id] = (lat, lon)

        # Add roads between locations
        # Weight is the actual haversine distance between coordinates
        roads = [
            ("patna_junction", "pmch_hospital"),
            ("patna_junction", "gandhi_maidan"),
            ("patna_junction", "frazer_road"),
            ("gandhi_maidan", "boring_road"),
            ("gandhi_maidan", "rajendra_nagar"),
            ("boring_road", "kankarbagh"),
            ("boring_road", "rajendra_nagar"),
            ("pmch_hospital", "ashok_rajpath"),
            ("pmch_hospital", "frazer_road"),
            ("bailey_road", "danapur"),
            ("bailey_road", "rajendra_nagar"),
            ("frazer_road", "ashok_rajpath"),
            ("kankarbagh", "ashok_rajpath"),
        ]

        for from_node, to_node in roads:
            lat1, lon1 = self.node_coordinates[from_node]
            lat2, lon2 = self.node_coordinates[to_node]
            distance = self.graph.haversine_distance(lat1, lon1, lat2, lon2)
            self.graph.add_edge(from_node, to_node, distance)

    def find_nearest_ambulance(self, patient: Patient, ambulances: list[Ambulance]) -> tuple[Optional[Ambulance], float]:
        # Find the closest available ambulance to the patient using haversine distance
        nearest_ambulance = None
        min_distance = float('inf')

        for ambulance in ambulances:
            dist = self.graph.haversine_distance(
                patient.latitude, patient.longitude,
                ambulance.latitude, ambulance.longitude
            )
            if dist < min_distance:
                min_distance = dist
                nearest_ambulance = ambulance

        return nearest_ambulance, min_distance

    def find_nearest_hospital(self, patient: Patient, hospitals: list[Hospital]) -> tuple[Optional[Hospital], float]:
        # Find the closest hospital with available beds
        nearest_hospital = None
        min_distance = float('inf')

        for hospital in hospitals:
            dist = self.graph.haversine_distance(
                patient.latitude, patient.longitude,
                hospital.latitude, hospital.longitude
            )
            if dist < min_distance:
                min_distance = dist
                nearest_hospital = hospital

        return nearest_hospital, min_distance

    def calculate_eta(self, distance_km: float, average_speed_kmh: float = 40) -> float:
        # ETA in minutes — assumes average city speed of 40 km/h
        return (distance_km / average_speed_kmh) * 60

    def plan_route(self, ambulance: Ambulance, patient: Patient, hospital: Hospital) -> dict:
        # Full route plan: ambulance → patient → hospital
        # Snaps all three GPS points to nearest graph nodes
        ambulance_node = self.graph.find_nearest_node(
            ambulance.latitude, ambulance.longitude, self.node_coordinates
        )
        patient_node = self.graph.find_nearest_node(
            patient.latitude, patient.longitude, self.node_coordinates
        )
        hospital_node = self.graph.find_nearest_node(
            hospital.latitude, hospital.longitude, self.node_coordinates
        )

        # Dijkstra: ambulance → patient
        dist1, path1 = self.graph.dijkstra(ambulance_node, patient_node)

        # Dijkstra: patient → hospital
        dist2, path2 = self.graph.dijkstra(patient_node, hospital_node)

        total_distance = dist1 + dist2
        total_eta = self.calculate_eta(total_distance)

        return {
            "ambulance_to_patient_path": path1,
            "patient_to_hospital_path": path2,
            "total_distance_km": round(total_distance, 2),
            "eta_minutes": round(total_eta, 2)
        }
