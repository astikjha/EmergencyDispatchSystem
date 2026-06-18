# emergency.py

class EmergencyRequest:

    def __init__(
        self,
        patient_name,
        location,
        severity
    ):

        self.patient_name = patient_name
        self.location = location
        self.severity = severity

    def __str__(self):

        return (
            f"Emergency("
            f"{self.patient_name}, "
            f"{self.severity})"
        )