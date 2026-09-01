import os

files_to_inspect = [
    r"e:\Projects\IMS_backend(M)\app\models\assignment.py",
    r"e:\Projects\IMS_backend(M)\app\models\audit_log.py",
    r"e:\Projects\IMS_backend(M)\app\models\signup_request.py",
    r"e:\Projects\IMS_backend(M)\app\routers\signup_router.py",
    r"e:\Projects\IMS_backend(M)\app\routers\admin_router.py",
    r"e:\Projects\IMS_backend(M)\app\routers\intern_router.py",
    r"e:\Projects\IMS_backend(M)\app\routers\mentor_router.py",
]

for p in files_to_inspect:
    if os.path.exists(p):
        print(f"==================== {os.path.basename(p)} ====================")
        with open(p, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            print("".join(lines[:40]))
