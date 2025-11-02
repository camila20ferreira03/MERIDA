def pk_user(user_id: str) -> str:
    return f"USER#{user_id}"

def pk_plot(plot_id: str) -> str:
    return f"PLOT#{plot_id}"

def pk_facility(facility_id: str) -> str:
    return f"FACILITY#{facility_id}"

def pk_sensor(sensor_id: str) -> str:
    return f"SENSOR#{sensor_id}"

def pk_species(species_id: str) -> str:
    return f"SPECIES#{species_id}"

def sk_state(timestamp: str) -> str:
    return f"STATE#{timestamp}"

def sk_event(timestamp: str) -> str:
    return f"EVENT#{timestamp}"

def gsi_pk(facility_id: str) -> str:
    return f"FACILITY#{facility_id}"

def gsi_sk(timestamp: str) -> str:
    return f"TIMESTAMP#{timestamp}"