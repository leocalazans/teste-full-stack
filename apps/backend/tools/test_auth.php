<?php
// Simple test script to reproduce CSRF -> login -> me flow using cookies
$cj = __DIR__ . '/cookies_test.txt';
function http_request($url, $post = null, $cj = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    if ($cj) {
        curl_setopt($ch, CURLOPT_COOKIEJAR, $cj);
        curl_setopt($ch, CURLOPT_COOKIEFILE, $cj);
    }
    if ($post !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));
    }
    $res = curl_exec($ch);
    $info = curl_getinfo($ch);
    echo "URL: $url\nHTTP_CODE: " . ($info['http_code'] ?? 'N/A') . "\n";
    if ($res === false) {
        echo "CURL_ERROR: " . curl_error($ch) . "\n";
    }
    echo "BODY:\n" . ($res === false ? '' : $res) . "\n----\n";
    curl_close($ch);
    return [$info, $res];
}

$base = 'http://127.0.0.1:8000/api';
http_request($base . '/csrf-cookie', null, $cj);
http_request($base . '/auth/login', ['email' => 'test@example.com', 'password' => 'password'], $cj);
http_request($base . '/auth/me', null, $cj);

echo "Cookie file: $cj\n";
?>