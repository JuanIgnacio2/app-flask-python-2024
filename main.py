import mysql.connector

#conn=mysql.connector.connect(host='localhost',username='root',password='codoacodo2024*',database='vinos_lombardi')
conn=mysql.connector.connect(host='localhost',username='root',password='',database='vinos_lombardi')
my_cursor=conn.cursor()
conn.commit()
conn.close()
print("Connection succefully created")