from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
import bcrypt

_ph = PasswordHasher()


def get_password_hash(password: str) -> str:
    return _ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False

    # Support legacy bcrypt hashes ($2b$, $2a$)
    if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        try:
            pwd_bytes = plain_password.encode("utf-8")[:72]
            hash_bytes = hashed_password.encode("utf-8")
            return bcrypt.checkpw(pwd_bytes, hash_bytes)
        except Exception:
            return False

    # Argon2 verification
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False
    except Exception:
        return False
