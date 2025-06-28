from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 바꿀 평문 비번 입력
plain_pwds = [
    "sunny90218",
    "j1234",
    "de316ec6",
]
for pwd in plain_pwds:
    print(pwd, "→", pwd_context.hash(pwd))
