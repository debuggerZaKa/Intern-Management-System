import os
import filecmp

dir1 = r"e:\proposal\backend\app"
dir2 = r"e:\Projects\IMS_backend(M)\app"

def get_rel_files(base_dir):
    rel_files = {}
    for root, _, files in os.walk(base_dir):
        if "__pycache__" in root:
            continue
        for f in files:
            full_p = os.path.join(root, f)
            rel_p = os.path.relpath(full_p, base_dir)
            rel_files[rel_p] = full_p
    return rel_files

f1 = get_rel_files(dir1)
f2 = get_rel_files(dir2)

added_in_new = set(f2.keys()) - set(f1.keys())
deleted_in_new = set(f1.keys()) - set(f2.keys())
common = set(f1.keys()) & set(f2.keys())

modified = []
identical = []

for rel in sorted(common):
    p1 = f1[rel]
    p2 = f2[rel]
    with open(p1, 'r', encoding='utf-8', errors='ignore') as fp1, open(p2, 'r', encoding='utf-8', errors='ignore') as fp2:
        c1 = fp1.read()
        c2 = fp2.read()
        if c1 != c2:
            modified.append(rel)
        else:
            identical.append(rel)

print("=== NEW FILES ADDED IN MODIFIED PROJECT ===")
for f in sorted(added_in_new):
    print("  +", f)

print("\n=== FILES DELETED IN MODIFIED PROJECT ===")
for f in sorted(deleted_in_new):
    print("  -", f)

print(f"\n=== MODIFIED FILES ({len(modified)}) ===")
for f in sorted(modified):
    print("  *", f)

print(f"\n=== IDENTICAL FILES ({len(identical)}) ===")
for f in sorted(identical):
    print("  =", f)
