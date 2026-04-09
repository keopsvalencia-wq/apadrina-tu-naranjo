import paramiko
import sys

host = 'home261044846.1and1-data.host'
port = 22
username = 'u50914626'
password = 'Miperrotous77'

try:
    print("Probando paramiko auth methods...")
    transport = paramiko.Transport((host, port))
    transport.connect()
    
    # Intenta password
    try:
        transport.auth_password(username, password)
        print("¡auth_password funcionó!")
    except paramiko.ssh_exception.AuthenticationException:
        print("auth_password falló. Intentando teclado interactivo...")
        
        def handler(title, instructions, prompt_list):
            return [password for _ in prompt_list]
            
        try:
            transport.auth_interactive(username, handler)
            print("¡auth_interactive funcionó!")
        except Exception as e:
            print(f"auth_interactive también falló: {e}")
            
    transport.close()
except Exception as e:
    print(f"Connection error: {e}")
