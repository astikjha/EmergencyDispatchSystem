from app.core.entities import Ambulance, Hospital, EmergencyRequest, SeverityLevel


class DispatchCenter:
    _instance = None  # stores the single instance

    # ── Singleton Pattern ──────────────────────────────────
    # __new__ runs before __init__ when creating an object.
    # We override it to check if an instance already exists.
    # If yes, return that same instance instead of making a new one.
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return  # skip re-initialization if already set up
        self.ambulances: dict[str, Ambulance] = {}    # hash map: id → Ambulance
        self.hospitals: dict[str, Hospital] = {}      # hash map: id → Hospital
        self.emergencies: dict[str, EmergencyRequest] = {}  # hash map: id → Emergency
        self._initialized = True

    # ── Ambulance management ──────────────────────────────
    def register_ambulance(self, ambulance: Ambulance):
        self.ambulances[ambulance.id] = ambulance

    def get_available_ambulances(self) -> list[Ambulance]:
        return [a for a in self.ambulances.values() if a.is_available()]

    # ── Hospital management ───────────────────────────────
    def register_hospital(self, hospital: Hospital):
        self.hospitals[hospital.id] = hospital

    def get_hospitals_with_capacity(self) -> list[Hospital]:
        return [h for h in self.hospitals.values() if h.has_capacity()]

    # ── Emergency management ──────────────────────────────
    def register_emergency(self, emergency: EmergencyRequest):
        self.emergencies[emergency.id] = emergency

    def get_emergency(self, emergency_id: str) -> EmergencyRequest:
        return self.emergencies.get(emergency_id)

    def get_all_emergencies(self) -> list[EmergencyRequest]:
        return list(self.emergencies.values())