<?php
/**
 * procesar_reserva.php
 * v3.0 - Sistema de Notificación Ligera (Gestión vía Supabase)
 */
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $to = "info@apadrinatunaranjo.es";
    $nombre = strip_tags($_POST['nombre'] ?? 'Cliente');
    $dni = strip_tags($_POST['dni'] ?? '-');
    $direccion = strip_tags($_POST['direccion'] ?? '-');
    $email_padrino = strip_tags($_POST['email'] ?? '-');
    $telefono = strip_tags($_POST['telefono'] ?? '-');
    $nombreArbol = strip_tags($_POST['nombreArbol'] ?? '-');
    $fechaArbol = strip_tags($_POST['fechaArbol'] ?? '-');
    
    if ($fechaArbol !== '-') {
        $fechaArbol = date("d/m/Y", strtotime($fechaArbol));
    }

    $subject = "=?UTF-8?B?" . base64_encode("🍊 NUEVA RESERVA: " . $nombre) . "?=";
    
    $body_html = "
    <!DOCTYPE html>
    <html>
    <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333; margin: 0;'>
        <div style='max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);'>
            <div style='background-color: #f57c00; padding: 25px; text-align: center;'>
                <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;'>Apadrina tu Naranjo</h1>
            </div>
            <div style='padding: 30px;'>
                <h2 style='color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; margin-top: 0;'>¡Nueva Reserva Registrada!</h2>
                <p style='font-size: 15px; line-height: 1.5;'>Hola Jose, tienes una nueva solicitud de apadrinamiento. Los detalles han sido guardados en la base de datos.</p>
                
                <table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>
                    <tr><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #666;'>Padrino:</td><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0;'>$nombre</td></tr>
                    <tr><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #666;'>DNI/NIE:</td><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0;'>$dni</td></tr>
                    <tr><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #666;'>Email:</td><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0;'><a href='mailto:$email_padrino' style='color: #f57c00;'>$email_padrino</a></td></tr>
                    <tr><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #666;'>Teléfono:</td><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0;'>$telefono</td></tr>
                    <tr><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #2e7d32;'>Árbol:</td><td style='padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #2e7d32;'>$nombreArbol</td></tr>
                </table>

                <div style='margin-top: 30px; padding: 20px; background-color: #fcf9f4; border: 1px solid #f57c00; border-radius: 8px; text-align: center;'>
                    <p style='margin: 0; font-weight: bold; color: #1e293b;'>Acción Requerida:</p>
                    <p style='margin: 10px 0; font-size: 14px;'>Accede a la web y activa el <b>Modo Jose</b> en la sección de comentarios para gestionar esta reserva.</p>
                    <a href='https://apadrinatunaranjo.es/#comentarios' style='display: inline-block; margin-top: 15px; background-color: #f57c00; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px;'>Ir al Panel de Gestión</a>
                </div>
            </div>
            <div style='background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;'>
                <p style='margin: 0; font-size: 12px; color: #94a3b8;'>Sistema Automatizado de Reservas - Apadrina tu Naranjo</p>
            </div>
        </div>
    </body>
    </html>";

    $sender = "info@apadrinatunaranjo.es";
    $headers  = "From: Web Apadrina <$sender>\r\n";
    $headers .= "Reply-To: $email_padrino\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    if (mail($to, $subject, $body_html, $headers, "-f $sender")) {
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "No se pudo enviar el correo"]);
    }
}
