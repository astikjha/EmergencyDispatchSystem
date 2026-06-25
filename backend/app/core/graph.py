import heapq
import math
from typing import Optional


class Graph:
    def __init__(self):
        # Adjacency list — hash map where key is node, value is list of (neighbor, weight)
        # Example: {"A": [("B", 5.2), ("C", 3.1)], "B": [("A", 5.2)]}
        self.adjacency_list: dict[str, list[tuple[str, float]]] = {}

    def add_node(self, node_id: str):
        # Add a location to the graph if it doesn't exist
        if node_id not in self.adjacency_list:
            self.adjacency_list[node_id] = []

    def add_edge(self, from_node: str, to_node: str, weight: float):
        # Add a road between two locations (undirected — works both ways)
        self.add_node(from_node)
        self.add_node(to_node)
        self.adjacency_list[from_node].append((to_node, weight))
        self.adjacency_list[to_node].append((from_node, weight))

    def get_neighbors(self, node_id: str) -> list[tuple[str, float]]:
        return self.adjacency_list.get(node_id, [])

    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        # Calculates real-world distance in km between two GPS coordinates
        # This is the formula used in maps to calculate distance on a sphere (Earth)
        R = 6371  # Earth's radius in km

        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))

        return R * c  # distance in km

    def dijkstra(self, start: str, end: str) -> tuple[float, list[str]]:
        # Returns (shortest distance, path as list of node ids)
        # Uses a min-heap priority queue internally

        # Priority queue entries are (distance, node_id)
        # heapq is a min-heap — always pops the smallest distance first
        priority_queue = [(0, start)]

        # Tracks shortest known distance to each node
        distances = {node: float('inf') for node in self.adjacency_list}
        distances[start] = 0

        # Tracks the path — for each node, which node did we come from
        previous = {node: None for node in self.adjacency_list}

        visited = set()

        while priority_queue:
            current_distance, current_node = heapq.heappop(priority_queue)

            # Skip if already processed
            if current_node in visited:
                continue
            visited.add(current_node)

            # Stop early if we reached the destination
            if current_node == end:
                break

            # Check all neighbors
            for neighbor, weight in self.get_neighbors(current_node):
                if neighbor in visited:
                    continue

                new_distance = current_distance + weight

                # If we found a shorter path to neighbor, update it
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous[neighbor] = current_node
                    heapq.heappush(priority_queue, (new_distance, neighbor))

        # Reconstruct path by walking backwards from end to start
        path = []
        current = end
        while current is not None:
            path.append(current)
            current = previous[current]
        path.reverse()

        return distances[end], path

    def find_nearest_node(self, lat: float, lon: float, node_coordinates: dict[str, tuple[float, float]]) -> str:
        # Given a GPS coordinate, find the closest node in the graph
        # Used to snap ambulance/patient/hospital positions onto the graph
        nearest = None
        min_distance = float('inf')

        for node_id, (node_lat, node_lon) in node_coordinates.items():
            dist = self.haversine_distance(lat, lon, node_lat, node_lon)
            if dist < min_distance:
                min_distance = dist
                nearest = node_id

        return nearest