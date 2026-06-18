# graph.py

class Graph:

    def __init__(self):
        self.graph = {}

    def add_node(self, node):

        if node not in self.graph:
            self.graph[node] = []

    def add_edge(self, source, destination, distance):

        self.graph[source].append(
            (destination, distance)
        )

        self.graph[destination].append(
            (source, distance)
        )

    def display(self):

        for node in self.graph:
            print(
                node,
                "->",
                self.graph[node]
            )