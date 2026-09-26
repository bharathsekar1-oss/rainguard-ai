def get_recommendations(risk_level: str) -> list[str]:
    if risk_level == "LOW":
        return [
            "Monitor rainfall conditions",
            "Stay informed via local weather updates"
        ]
    elif risk_level == "MODERATE":
        return [
            "Monitor local alerts closely",
            "Avoid unnecessary travel in low-lying areas",
            "Keep emergency contacts ready"
        ]
    elif risk_level == "HIGH":
        return [
            "Avoid flood-prone roads and low-lying areas",
            "Move vehicles and valuables to higher ground",
            "Prepare emergency supplies and evacuation kit",
            "Stay tuned to emergency broadcasts"
        ]
    elif risk_level == "CRITICAL":
        return [
            "Evacuate low-lying and flood-prone areas immediately when instructed",
            "Avoid all waterlogged roads and bridges",
            "Contact emergency services if stranded",
            "Move to higher ground immediately",
            "Do not attempt to walk or drive through floodwaters"
        ]
    return []
