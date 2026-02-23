import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("phishing_detector.log")
    ]
)

logger = logging.getLogger("phishing_detector")

def get_logger(name: str):
    return logging.getLogger(f"phishing_detector.{name}")
