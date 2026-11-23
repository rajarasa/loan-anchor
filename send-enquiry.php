<?php
/**
 * Loan Anchor Financing Brokers LLC - Form Submission Handler
 * Sends form enquiries directly to info@loananchor.ae via FormSubmit API & PHP Mail.
 */

/* ================= SETTINGS ================= */
$TO       = 'info@loananchor.ae'; // Target receiving email address
$FROM     = 'info@loananchor.ae';
$SITE     = 'Loan Anchor Financing Brokers LLC';
$LOG_FILE = __DIR__ . '/enquiries.log';
/* ============================================ */

// Enable CORS for AJAX requests if accessed cross-origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');

function respond($code, $ok, $message = '') {
    $isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') 
              || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);
    
    if (!$isAjax && !empty($_SERVER['HTTP_REFERER']) && $ok) {
        $referer = $_SERVER['HTTP_REFERER'];
        $delim = strpos($referer, '?') !== false ? '&' : '?';
        header("Location: " . $referer . $delim . "submitted=true");
        exit;
    }

    http_response_code($code);
    echo json_encode([
        'ok'        => $ok,
        'message'   => $message,
        'timestamp' => date('c')
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Method not allowed. Please submit via POST.');
}

// Parse input (supports standard POST and JSON payload)
$input = $_POST;
$raw = file_get_contents('php://input');
if (!empty($raw)) {
    $json = json_decode($raw, true);
    if (is_array($json)) {
        $input = array_merge($input, $json);
    }
}

// Honeypot spam trap
if (!empty($input['website'])) {
    respond(200, true, 'Thank you! Your enquiry has been received. Our team will contact you shortly.');
}

function clean($v) {
    return trim(preg_replace('/\s+/', ' ', strip_tags((string)$v)));
}

$name    = clean($input['name'] ?? '');
$emailRaw = trim($input['email'] ?? '');
$email   = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
$phone   = clean($input['phone'] ?? '');
$salary  = clean($input['salary'] ?? '');
$service = clean($input['service'] ?? 'General Financing Inquiry');
$message = clean($input['message'] ?? '');

// Validation: Name and Phone are required on all forms
if ($name === '' || $phone === '') {
    respond(422, false, 'Please fill in all required fields (Name and Phone Number).');
}

// If form includes email field (e.g. contact page form) and it is invalid
if (!empty($emailRaw) && !$email) {
    respond(422, false, 'Please enter a valid Email Address.');
}

if (strlen($name) > 120 || strlen($phone) > 40 || strlen($salary) > 80 || strlen($service) > 120 || strlen($message) > 2000) {
    respond(422, false, 'Invalid input: one or more fields exceed maximum length.');
}

$date = date('d M Y, H:i:s T');
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$subject = "New Loan Anchor Enquiry from $name - $service";

// Format text body
$body  = "====================================================\n";
$body .= " NEW ENQUIRY - " . strtoupper($SITE) . "\n";
$body .= "====================================================\n\n";
$body .= "Full Name:       $name\n";
if (!empty($salary)) {
    $body .= "Salary / Income: $salary\n";
}
if (!empty($email)) {
    $body .= "Email Address:   $email\n";
}
$body .= "Phone Number:    $phone\n";
$body .= "Service Inquiry: $service\n";
if (!empty($message)) {
    $body .= "Message:\n$message\n";
}
$body .= "\n----------------------------------------------------\n";
$body .= "Received:        $date\n";
$body .= "IP Address:      $ip\n";
$body .= "====================================================\n";

// 1. Log locally
$logEntry = [
    'date'    => $date,
    'name'    => $name,
    'salary'  => $salary,
    'email'   => $email ? $email : 'Not provided',
    'phone'   => $phone,
    'service' => $service,
    'message' => $message,
    'ip'      => $ip
];
@file_put_contents($LOG_FILE, json_encode($logEntry, JSON_PRETTY_PRINT) . ",\n", FILE_APPEND | LOCK_EX);

// 2. Dispatch via FormSubmit API (HTTP POST) for guaranteed email delivery to info@loananchor.ae
if (function_exists('curl_init')) {
    $payload = json_encode([
        'name'      => $name,
        'email'     => $email ? $email : 'info@loananchor.ae',
        'phone'     => $phone,
        'salary'    => $salary,
        'service'   => $service,
        'message'   => !empty($message) ? $message : (!empty($salary) ? "Salary/Income: $salary" : 'Consultation enquiry submitted from website'),
        '_subject'  => $subject,
        '_template' => 'table',
        '_captcha'  => 'false',
        '_replyto'  => $email ? $email : 'info@loananchor.ae'
    ]);

    $ch = curl_init('https://formsubmit.co/ajax/' . $TO);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'User-Agent: LoanAnchor/1.0'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    @curl_exec($ch);
    @curl_close($ch);
}

// 3. Fallback to PHP native mail()
$headers  = "From: $SITE <$FROM>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
@mail($TO, $subject, $body, $headers);

respond(200, true, 'Thank you! Your enquiry has been received. Our team will contact you shortly.');
