from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL de conexión a la base de datos
DATABASE_URL = "postgresql+psycopg2://postgres:iamai999@localhost:5432/iassisto"

# Se crea el motor de la base de datos
engine = create_engine(DATABASE_URL)
# Se crea la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()