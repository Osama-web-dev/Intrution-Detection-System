import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from ml.model import PhishingModel

try:
    model = PhishingModel()
    text = "Dear Valued User, We are pleased to inform you that your email address has been randomly selected as the winner... http://secure-verify-reward.test/claim?id=982341"
    result = model.predict(text)
    print(result)
except Exception as e:
    import traceback
    traceback.print_exc()
