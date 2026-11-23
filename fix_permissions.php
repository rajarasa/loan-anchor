<?php
/**
 * Server Permission Fixer Script - Loan Anchor
 * 
 * Recursively scans the current directory (__DIR__) and all subdirectories:
 * - Changes all directory permissions to 0755
 * - Changes all file permissions to 0644
 * Uses RecursiveIteratorIterator and chmod() safely.
 */

// If accessed via web browser, send plain text headers
if (php_sapi_name() !== 'cli' && !headers_sent()) {
    header('Content-Type: text/plain; charset=utf-8');
}

$targetDir = __DIR__;
$dirCount = 0;
$fileCount = 0;
$errors = [];

try {
    // 1. Fix root directory itself to 0755
    if (@chmod($targetDir, 0755)) {
        $dirCount++;
    } else {
        $errors[] = "Could not set permissions for root directory: $targetDir";
    }

    // 2. Recursively iterate through all directories and files
    $directoryIterator = new RecursiveDirectoryIterator(
        $targetDir,
        RecursiveDirectoryIterator::SKIP_DOTS | FilesystemIterator::UNIX_PATHS
    );
    
    $iterator = new RecursiveIteratorIterator(
        $directoryIterator,
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $item) {
        $path = $item->getPathname();

        if ($item->isDir()) {
            if (@chmod($path, 0755)) {
                $dirCount++;
            } else {
                $errors[] = "Failed to chmod directory (0755): $path";
            }
        } elseif ($item->isFile() || $item->isLink()) {
            if (@chmod($path, 0644)) {
                $fileCount++;
            } else {
                $errors[] = "Failed to chmod file (0644): $path";
            }
        }
    }

    echo "Permissions Fixed Successfully!\n";
    echo "Summary:\n";
    echo "- Directories updated to 0755: $dirCount\n";
    echo "- Files updated to 0644: $fileCount\n";

    if (!empty($errors)) {
        echo "\nNotices (" . count($errors) . "):\n";
        foreach (array_slice($errors, 0, 10) as $error) {
            echo "  [!] $error\n";
        }
        if (count($errors) > 10) {
            echo "  ... and " . (count($errors) - 10) . " more.\n";
        }
    }
} catch (Exception $e) {
    echo "Error processing permissions: " . $e->getMessage() . "\n";
}
