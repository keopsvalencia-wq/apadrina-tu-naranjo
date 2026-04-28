<?php
/**
 * procesar_reserva.php
 * v2.6 - Base64 Encoded HTML - OX Webmail Fix
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
    
    // HTML in-line robusto con el diseño "Franja Naranja"
    $body_html = "<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333; margin: 0;'><div style='max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);'><div style='background-color: #f57c00; padding: 25px; text-align: center;'><h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;'>Apadrina tu Naranjo</h1></div><div style='padding: 30px;'><h2 style='color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; margin-top: 0;'>Nueva Solicitud Recibida</h2><p style='font-size: 15px; line-height: 1.5;'>Hola Jose, tienes una nueva reserva de apadrinamiento:</p><table style='width: 100%; border-collapse: collapse; margin-top: 20px;'><tr><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; width: 40%; color: #666;'>Padrino:</td><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #111;'>$nombre</td></tr><tr><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #666;'>DNI/NIE:</td><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #111;'>$dni</td></tr><tr><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #666;'>Email:</td><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0;'><a href='mailto:$email_padrino' style='color: #f57c00; text-decoration: none;'>$email_padrino</a></td></tr><tr><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #666;'>Teléfono:</td><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #111;'>$telefono</td></tr><tr><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #666;'>Dirección:</td><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #111;'>$direccion</td></tr><tr><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #2e7d32;'>Árbol:</td><td style='padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #2e7d32;'>$nombreArbol</td></tr><tr><td style='padding: 12px 0; font-weight: bold; color: #666;'>Fecha Especial:</td><td style='padding: 12px 0; color: #111;'>$fechaArbol</td></tr></table><div style='margin-top: 35px; text-align: center; background-color: #fcf9f4; padding: 15px; border-radius: 6px; border: 1px dashed #dec1af;'><p style='margin: 0; font-size: 13px; color: #574235;'>Será oficial al confirmar el pago. <br><strong>El contrato completo en PDF está adjunto.</strong></p></div></div></div></body></html>";

    $pdf_base64 = $_POST['pdf_base64'] ?? '';
    if (empty($pdf_base64)) {
        http_response_code(400);
        die(json_encode(["status" => "error", "message" => "Falta PDF"]));
    }

    $pdf_content = (strpos($pdf_base64, 'base64,') !== false) ? explode('base64,', $pdf_base64)[1] : $pdf_base64;
    // Limpiar posibles espacios o saltos de línea del base64
    $pdf_content = str_replace([" ", "\n", "\r"], ["+", "", ""], $pdf_content);
    $pdf_decoded = base64_decode($pdf_content);

    if (!$pdf_decoded || strlen($pdf_decoded) < 1000) {
        http_response_code(400);
        die(json_encode(["status" => "error", "message" => "El PDF generado es demasiado pequeño o inválido"]));
    }

    $file_name = "Contrato_" . preg_replace('/[^A-Za-z0-9]/', '_', $nombre) . ".pdf";

    $eol = "\r\n"; // Forzar CRLF para máxima compatibilidad con servidores de correo
    $separator = md5(time());
    $sender = "info@apadrinatunaranjo.es";
    
    // Headers simples, sin doble salto de línea problemático al final
    $headers  = "From: Web Apadrina <$sender>" . $eol;
    $headers .= "Reply-To: $email_padrino" . $eol;
    $headers .= "MIME-Version: 1.0" . $eol;
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $separator . "\"";
    
    // Cuerpo HTML (Inline para evitar que se vea como adjunto)
    $body = "--" . $separator . $eol;
    $body .= "Content-Type: text/html; charset=\"UTF-8\"" . $eol;
    $body .= "Content-Transfer-Encoding: 8bit" . $eol;
    $body .= "Content-Disposition: inline" . $eol . $eol;
    $body .= $body_html . $eol;
    
    // Adjunto PDF
    $body .= "--" . $separator . $eol;
    $body .= "Content-Type: application/pdf; name=\"" . $file_name . "\"" . $eol;
    $body .= "Content-Transfer-Encoding: base64" . $eol;
    $body .= "Content-Disposition: attachment; filename=\"" . $file_name . "\"" . $eol . $eol;
    $body .= chunk_split(base64_encode($pdf_decoded)) . $eol;
    
    $body .= "--" . $separator . "--";

    if (mail($to, $subject, $body, $headers, "-f $sender")) {
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error"]);
    }
}
