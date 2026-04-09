import paramiko
import os

host = 'home261044846.1and1-data.host'
port = 22
username = 'u50914626'
password = 'Miperrotous77'

local_path = 'z:\\APLICACIONES CON IA\\APADRINA TU NARANJO'

# Archivos a ignorar
ignore_files = ['sftp_deploy.py', '.git']

try:
    print("Iniciando conexión SFTP con IONOS...")
    transport = paramiko.Transport((host, port))
    transport.connect(username=username, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)
    
    print("Conectado con éxito.")
    
    # Determinar ruta remota
    remote_base = '/'
    dirs = sftp.listdir(remote_base)
    # A veces ionos usa una carpeta para el dominio
    for d in dirs:
        if 'apadrinatunaranjo' in d.lower():
            remote_base = f'/{d}'
            break
            
    print(f"Directorio remoto base seleccionado: {remote_base}")

    def upload_dir(local_dir, remote_dir):
        try:
            sftp.chdir(remote_dir)
        except IOError:
            sftp.mkdir(remote_dir)
            sftp.chdir(remote_dir)
            
        for item in os.listdir(local_dir):
            if item in ignore_files or item.startswith('.'):
                continue
                
            l_path = os.path.join(local_dir, item)
            r_path = f"{remote_dir}/{item}".replace('\\', '/')
            
            if os.path.isfile(l_path):
                print(f"Subiendo {item} a {r_path}...")
                sftp.put(l_path, r_path)
            elif os.path.isdir(l_path):
                print(f"Creando directorio {r_path}...")
                upload_dir(l_path, r_path)

    upload_dir(local_path, remote_base)
    print("Despliegue completado con éxito de todos los archivos.")
    
    sftp.close()
    transport.close()
except Exception as e:
    print(f"Error durante el despliegue: {e}")
