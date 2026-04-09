import ftplib
import ssl

host = 'home261044846.1and1-data.host'
username = 'u50914626'
password = 'Miperrotous77'

try:
    print("Iniciando conexión FTP-TLS (FTPS) con IONOS...")
    ftp = ftplib.FTP_TLS(host)
    ftp.login(username, password)
    ftp.prot_p() # Data connection encryption
    print("¡Conectado por FTP clásico con TLS!")
    ftp.quit()
except Exception as e:
    print(f"Error FTP: {e}")
