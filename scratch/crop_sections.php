<?php
$src = imagecreatefromjpeg('C:/Users/rajar/.gemini/antigravity/brain/2474831f-3d40-4855-9b3d-f016913ff2ee/.user_uploaded/media_1794460265911_a61f2289.jpg');
// Crop top section: y 0 to 180
$crop1 = imagecrop($src, ['x' => 0, 'y' => 0, 'width' => 252, 'height' => 180]);
imagejpeg($crop1, 'scratch/crop_exp.jpg', 100);

// Crop middle section: y 160 to 320
$crop2 = imagecrop($src, ['x' => 0, 'y' => 160, 'width' => 252, 'height' => 180]);
imagejpeg($crop2, 'scratch/crop_mid.jpg', 100);

// Crop bottom section: y 300 to 460
$crop3 = imagecrop($src, ['x' => 0, 'y' => 300, 'width' => 252, 'height' => 160]);
imagejpeg($crop3, 'scratch/crop_bot.jpg', 100);

echo "Cropped successfully.\n";

