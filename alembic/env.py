import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# ------------------------------------
# ✅ 1. .env 파일 로드
# ------------------------------------
load_dotenv()

# Alembic Config 객체
config = context.config

# ✅ 2. .env에서 DATABASE_URL 읽어와 sqlalchemy.url로 설정
config.set_main_option("sqlalchemy.url", os.getenv("SYNC_DATABASE_URL"))

# 로깅 설정
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ------------------------------------
# ✅ 3. 모델 import 및 metadata 설정
# ------------------------------------
# 현재 경로를 기준으로 상위 경로(프로젝트 루트) 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db import Base  # Base = declarative_base()
from app.models.user import User
from app.models.menu import Menu  # ← menu 테이블 모델

target_metadata = Base.metadata  # Alembic이 테이블 구조를 자동 인식

# ------------------------------------
# 이하 기본 템플릿 동일 (수정 없음)
# ------------------------------------

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
