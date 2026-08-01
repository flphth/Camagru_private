<?php

class Mailer
{
    // Send an HTML email using the PHP standard mail() function
    public static function send($to, $subject, $htmlBody)
    {
        $from = getenv('MAIL_FROM') ?: 'no-reply@camagru.local';

        $headers = implode("\r\n", [
            'From: ' . $from,
            'Reply-To: ' . $from,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8'
        ]);

        // Suppress transport warnings so a failed relay never corrupts the JSON response
        return @mail($to, $subject, $htmlBody, $headers);
    }
}
