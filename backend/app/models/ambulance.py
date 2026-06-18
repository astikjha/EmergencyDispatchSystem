# ambulance.py

class Ambulance:

    def __init__(
        self,
        ambulance_id,
        location,
        status
    ):

        self.ambulance_id = ambulance_id
        self.location = location
        self.status = status

    def __str__(self):

        return (
            f"Ambulance("
            f"{self.ambulance_id}, "
            f"{self.location}, "
            f"{self.status})"
        )