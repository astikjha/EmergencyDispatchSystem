from app.core.entities import Ambulance, Hospital, Patient
from app.core.route_planner import RoutePlanner

planner = RoutePlanner()

# Simulate an emergency in Patna
patient = Patient("Rahul Kumar", 28, "chest pain", 25.5941, 85.1300)
ambulance = Ambulance("AMB-001", "Suresh", 25.6093, 85.1376)
hospital = Hospital("PMCH", 25.6137, 85.1446, 50)

# Find route
route = planner.plan_route(ambulance, patient, hospital)

print("Ambulance → Patient path:", route["ambulance_to_patient_path"])
print("Patient → Hospital path:", route["patient_to_hospital_path"])
print("Total distance:", route["total_distance_km"], "km")
print("ETA:", route["eta_minutes"], "minutes")