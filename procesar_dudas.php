<?php
/**
 * procesar_dudas.php
 * Procesa el formulario de contacto/dudas con formato premium consistente.
 * v2.0 - Diseño premium consistente.
 */
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $to = "info@apadrinatunaranjo.es";
    $nombre = $_POST['nombre'] ?? 'Alguien';
    $email_cliente = $_POST['email'] ?? '';
    $mensaje = $_POST['mensaje'] ?? '(Sin mensaje)';
    
    $subject = "✉️ Nueva Consulta: " . $nombre;
    
    // Cuerpo HTML Premium (Consistente con Reservas)
    $body_html = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
            .header { background: #1b6d24; padding: 30px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
            .content { padding: 40px; color: #444; line-height: 1.6; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; background-color: #e8f5e9; color: #2e7d32; font-weight: bold; font-size: 12px; margin-bottom: 20px; text-transform: uppercase; }
            .message-box { background-color: #f1f8e9; border-left: 4px solid #1b6d24; padding: 25px; border-radius: 4px 12px 12px 4px; margin: 25px 0; color: #333; }
            .footer { background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
            .btn { display: inline-block; padding: 12px 25px; background-color: #1b6d24; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; }
        </style>
    </head>
    <body style='margin: 0; padding: 20px; background-color: #fcf9f4;'>
        <div class='container'>
            <div class='header'>
                <h1>Apadrina tu Naranjo</h1>
            </div>
            <div class='content'>
                <span class='badge'>Nueva Consulta Recibida</span>
                <h2 style='color: #333; margin-top: 0;'>¡Hola Jose!</h2>
                <p>Alguien ha escrito una duda desde la web. Aquí tienes los detalles:</p>
                
                <p><strong>De:</strong> $nombre (<a href='mailto:$email_cliente' style='color: #1b6d24;'>$email_cliente</a>)</p>

                <div class='message-box'>
                    <p style='margin: 0; font-style: italic;'>\"$mensaje\"</p>
                </div>

                <div style='text-align: center;'>
                    <a href='mailto:$email_cliente' class='btn'>Responder al Mensaje</a>
                </div>
            </div>
            <div class='footer'>
                <p>Sistema de Contacto - apadrinatunaranjo.es</p>
            </div>
        </div>
    </body>
    </html>";

    $sender = "info@apadrinatunaranjo.es";
    $headers = "From: Web Apadrina tu Naranjo <$sender>\r\n";
    $headers .= "Reply-To: $email_cliente\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    if (mail($to, $subject, $body_html, $headers, "-f $sender")) {
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error"]);
    }
}
