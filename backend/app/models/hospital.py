# hospital.py

class Hospital:

    def __init__(
        self,
        hospital_id,
        name,
        location
    ):

        self.hospital_id = hospital_id
        self.name = name
        self.location = location

    def __str__(self):

        return (
            f"Hospital("
            f"{self.name})"
        )