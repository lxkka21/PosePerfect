"""
One-time setup script for PythonAnywhere deployment.
Run this in a PythonAnywhere Bash console.
Usage: python setup_pythonanywhere.py YOUR_USERNAME
"""
import sys
import os

if len(sys.argv) < 2:
    print("Usage: python setup_pythonanywhere.py YOUR_PYTHONANYWHERE_USERNAME")
    sys.exit(1)

username = sys.argv[1]

# Clone repo
os.system("cd ~ && git clone https://github.com/lxkka21/PosePerfect.git")

# Setup venv and install
os.system("cd ~/PosePerfect/backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt")

# Create WSGI file
wsgi_path = f"/var/www/{username}_pythonanywhere_com_wsgi.py"
wsgi_content = f"""import sys
path = '/home/{username}/PosePerfect/backend'
if path not in sys.path:
    sys.path.append(path)
from flask_app import app as application
"""
with open(wsgi_path, 'w') as f:
    f.write(wsgi_content)

print(f"\n✅ Done! Now go to your PythonAnywhere Web tab and:")
print(f"1. Add a new web app -> Manual Config -> Python 3.12")
print(f"2. Set 'Source code' to: /home/{username}/PosePerfect/backend")
print(f"3. Set 'WSGI config file' to: {wsgi_path}")
print(f"4. Click Reload")
print(f"\nYour backend will be at: https://{username}.pythonanywhere.com")
