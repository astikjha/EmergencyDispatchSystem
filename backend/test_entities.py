from app.core.entities import Ambulance, Hospital, Patient, EmergencyRequest, SeverityLevel
from app.core.dispatch_center import DispatchCenter

# Test Singleton — both variables should point to the same object
dc1 = DispatchCenter()
dc2 = DispatchCenter()
print("Singleton works:", dc1 is dc2)  # should print True

# Create objects
ambulance = Ambulance("AMB-001", "Rajesh Kumar", 25.5941, 85.1376)
hospital = Hospital("PMCH Patna", 25.6093, 85.1376, total_beds=50)
patient = Patient("Amit Singh", 35, "chest pain, shortness of breath", 25.5800, 85.1300)
emergency = EmergencyRequest(patient, "cardiac", SeverityLevel.CRITICAL)

# Register in dispatch center
dc1.register_ambulance(ambulance)
dc1.register_hospital(hospital)
dc1.register_emergency(emergency)

# Dispatch
emergency.dispatch(ambulance, hospital, eta=8.5)

print("Emergency status:", emergency.status.value)       # dispatched
print("Ambulance status:", ambulance.status.value)       # busy
print("Hospital beds left:", hospital.available_beds)    # 49
print("Available ambulances:", len(dc1.get_available_ambulances()))  # 0