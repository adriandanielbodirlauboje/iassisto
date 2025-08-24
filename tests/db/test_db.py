import psycopg2
try:
    conn = psycopg2.connect(
        dbname="iassisto",
        user="postgres",
        password="iamai999", # Contraseña del superusuario (pendiente de ponerla en un archivo de configuración)
        host="localhost",
        port="5432"
    )
    print("✅ Conexión exitosa a PostgreSQL")
    conn.close()
except Exception as e:
    print("❌ Error al conectar:", e)
