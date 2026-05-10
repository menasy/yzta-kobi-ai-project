# db/base.py
# SQLAlchemy Declarative Base tanımı.
# Tüm ORM modelleri bu Base'den miras alır.
# Alembic bu dosyadaki Base.metadata'yı kullanır.

from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass


class Base(DeclarativeBase):
    """
    Tüm ORM modellerinin miras alacağı temel sınıf.

    Kullanım:
        class User(Base, TimestampMixin):
            __tablename__ = "users"
            ...
    """

    pass
