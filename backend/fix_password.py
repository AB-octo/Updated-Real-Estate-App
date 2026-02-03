from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("ALTER USER postgres WITH PASSWORD 'postgres';")
print("Password reset successfully")
