from db import Base, engine

# Crear todas las tablas en la base de datos
# Solamente es necesario ejecutar este archivo una vez para crear las tablas
print("🔧 Creando tablas en la base de datos...")
Base.metadata.create_all(bind=engine)
print("✅ Listo.")
