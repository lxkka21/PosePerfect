# Run this in a PythonAnywhere Bash console after:
# 1. Sign up at https://www.pythonanywhere.com (free, no credit card)
# 2. Open a Bash console from the Dashboard

git clone https://github.com/lxkka21/PosePerfect.git
cd PosePerfect
python -m venv venv
source venv/bin/activate
cd backend && pip install -r requirements.txt && cd ..
