<?php
$files = ['index.html', 'about.html', 'services.html', 'contact.html'];
foreach ($files as $file) {
    $content = file_get_contents($file);
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML($content);
    $errors = libxml_get_errors();
    libxml_clear_errors();
    
    // Check key elements
    $title = $dom->getElementsByTagName('title')->item(0)->textContent ?? 'NONE';
    $forms = $dom->getElementsByTagName('form')->length;
    $images = $dom->getElementsByTagName('img')->length;
    
    echo "$file: Title='$title', Forms=$forms, Images=$images\n";
}

