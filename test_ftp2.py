import ftplib
import ssl

host = 'home261044846.1and1-data.host'
username = 'u50914626'
password = 'Miperrotous77'

try:
    print("Iniciando conexión FTP pura con IONOS...")
    ftp = ftplib.FTP()
    ftp.connect(host, 21)
    ftp.login(username, password)
    print("¡Conectado por FTP puro!")
    ftp.quit()
except Exception as e:
    print(f"Error FTP: {e}")
