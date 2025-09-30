<?php
// Secure image serving script
// This script serves images from the storage directory with proper headers

// Get the requested file path
$requestedFile = $_GET['file'] ?? '';
$type = $_GET['type'] ?? '';

// Validate the type parameter
$allowedTypes = ['cover-photos', 'profile-photos', 'resumes'];
if (!in_array($type, $allowedTypes)) {
    http_response_code(400);
    die('Invalid file type');
}

// Sanitize the filename
$filename = basename($requestedFile);
if (empty($filename) || strpos($filename, '..') !== false) {
    http_response_code(400);
    die('Invalid filename');
}

// Construct the full file path
$filePath = __DIR__ . '/' . $type . '/' . $filename;

// Check if file exists
if (!file_exists($filePath)) {
    http_response_code(404);
    die('File not found');
}

// Get file info
$fileInfo = pathinfo($filePath);
$extension = strtolower($fileInfo['extension']);

// Set appropriate content type
$contentTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp',
    'pdf' => 'application/pdf'
];

if (isset($contentTypes[$extension])) {
    header('Content-Type: ' . $contentTypes[$extension]);
} else {
    header('Content-Type: application/octet-stream');
}

// Set cache headers
header('Cache-Control: public, max-age=31536000'); // 1 year
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');

// Set security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Output the file
readfile($filePath);
?>
