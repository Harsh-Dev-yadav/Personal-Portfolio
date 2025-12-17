<?php
/**
 * Contact Form Processing Script
 * 
 * This script handles form submissions from the resume website contact form.
 * It validates input, prevents SQL injection using prepared statements,
 * and returns JSON responses for AJAX handling.
 * 
 * @package ResumeWebsite
 * @version 1.0
 */

// Include database configuration
require_once 'config.php';

// Set JSON header for response
header('Content-Type: application/json');

// ================================
// VALIDATE REQUEST METHOD
// ================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Only POST requests are accepted.'
    ]);
    exit;
}

// ================================
// RETRIEVE AND SANITIZE FORM DATA
// ================================

// Get POST data
$fullName = isset($_POST['fullname']) ? sanitizeInput($_POST['fullname']) : '';
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$subject = isset($_POST['subject']) ? sanitizeInput($_POST['subject']) : '';
$reason = isset($_POST['reason']) ? sanitizeInput($_POST['reason']) : '';
$message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';

// Get additional metadata
$ipAddress = getClientIP();
$userAgent = getUserAgent();

// ================================
// VALIDATION
// ================================

$errors = [];

// Validate full name
if (empty($fullName)) {
    $errors[] = 'Full name is required.';
} elseif (strlen($fullName) < 2) {
    $errors[] = 'Full name must be at least 2 characters long.';
} elseif (strlen($fullName) > 100) {
    $errors[] = 'Full name must not exceed 100 characters.';
}

// Validate email
if (empty($email)) {
    $errors[] = 'Email address is required.';
} elseif (!validateEmail($email)) {
    $errors[] = 'Please provide a valid email address.';
} elseif (strlen($email) > 255) {
    $errors[] = 'Email address is too long.';
}

// Validate subject
if (empty($subject)) {
    $errors[] = 'Subject is required.';
} elseif (strlen($subject) < 3) {
    $errors[] = 'Subject must be at least 3 characters long.';
} elseif (strlen($subject) > 255) {
    $errors[] = 'Subject must not exceed 255 characters.';
}

// Validate reason
$validReasons = ['job', 'project', 'feedback', 'other'];
if (empty($reason)) {
    $errors[] = 'Please select a reason for contact.';
} elseif (!in_array($reason, $validReasons)) {
    $errors[] = 'Invalid reason selected.';
}

// Validate message
if (empty($message)) {
    $errors[] = 'Message is required.';
} elseif (strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters long.';
} elseif (strlen($message) > 5000) {
    $errors[] = 'Message must not exceed 5000 characters.';
}

// Check for validation errors
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed: ' . implode(' ', $errors),
        'errors' => $errors
    ]);
    exit;
}

// ================================
// SPAM PROTECTION (Basic)
// ================================

// Simple honeypot check (add a hidden field in your form with name="website")
if (isset($_POST['website']) && !empty($_POST['website'])) {
    // This field should be empty for legitimate users
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Spam detected.'
    ]);
    exit;
}

// Rate limiting: Check if the same IP has submitted recently (basic protection)
// In production, consider using more sophisticated rate limiting

// ================================
// DATABASE INSERTION
// ================================

try {
    // Get database connection
    $conn = getDatabaseConnection();
    
    // Prepare SQL statement
    $sql = "INSERT INTO contact_messages 
            (full_name, email, subject, reason, message, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    
    // Bind parameters (s = string)
    $stmt->bind_param(
        "sssssss",
        $fullName,
        $email,
        $subject,
        $reason,
        $message,
        $ipAddress,
        $userAgent
    );
    
    // Execute statement
    if ($stmt->execute()) {
        $insertId = $stmt->insert_id;
        
        // Close statement and connection
        $stmt->close();
        $conn->close();
        
        // ================================
        // OPTIONAL: SEND EMAIL NOTIFICATION
        // ================================
        
        // Uncomment to send email notification to admin
        /*
        $adminEmail = "your-email@example.com";
        $emailSubject = "New Contact Form Submission: " . $subject;
        $emailBody = "You have received a new message from your resume website.\n\n" .
                     "Name: {$fullName}\n" .
                     "Email: {$email}\n" .
                     "Subject: {$subject}\n" .
                     "Reason: {$reason}\n" .
                     "Message:\n{$message}\n\n" .
                     "Submitted at: " . date('Y-m-d H:i:s') . "\n" .
                     "IP Address: {$ipAddress}";
        
        $headers = "From: noreply@yourdomain.com\r\n" .
                   "Reply-To: {$email}\r\n" .
                   "X-Mailer: PHP/" . phpversion();
        
        mail($adminEmail, $emailSubject, $emailBody, $headers);
        */
        
        // Return success response
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your message! I will get back to you soon.',
            'id' => $insertId
        ]);
        
    } else {
        throw new Exception("Failed to insert data: " . $stmt->error);
    }
    
} catch (Exception $e) {
    // Log error
    error_log("Form submission error: " . $e->getMessage());
    
    // Close connections if open
    if (isset($stmt) && $stmt) {
        $stmt->close();
    }
    if (isset($conn) && $conn) {
        $conn->close();
    }
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => DEBUG_MODE 
            ? 'Database error: ' . $e->getMessage() 
            : 'An error occurred while processing your request. Please try again later.'
    ]);
}

// ================================
// ALTERNATIVE: PDO VERSION
// ================================

/*
// Uncomment this section if you prefer to use PDO instead of MySQLi

try {
    // Get PDO connection
    $pdo = getPDOConnection();
    
    // Prepare SQL statement
    $sql = "INSERT INTO contact_messages 
            (full_name, email, subject, reason, message, ip_address, user_agent) 
            VALUES (:full_name, :email, :subject, :reason, :message, :ip_address, :user_agent)";
    
    $stmt = $pdo->prepare($sql);
    
    // Execute with bound parameters
    $stmt->execute([
        ':full_name' => $fullName,
        ':email' => $email,
        ':subject' => $subject,
        ':reason' => $reason,
        ':message' => $message,
        ':ip_address' => $ipAddress,
        ':user_agent' => $userAgent
    ]);
    
    $insertId = $pdo->lastInsertId();
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message! I will get back to you soon.',
        'id' => $insertId
    ]);
    
} catch (PDOException $e) {
    error_log("Form submission error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => DEBUG_MODE 
            ? 'Database error: ' . $e->getMessage() 
            : 'An error occurred while processing your request. Please try again later.'
    ]);
}
*/

?>