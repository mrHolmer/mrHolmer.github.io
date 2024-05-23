<?php
// Define the base directory where the photos are located
$baseDirectory = __DIR__ . '/FACES';

// Get a random department directory
$departmentDirectories = glob($baseDirectory . '/*', GLOB_ONLYDIR);
$randomDepartmentDirectory = $departmentDirectories[array_rand($departmentDirectories)];

// Get all photo files within the random department directory
$photoFiles = glob($randomDepartmentDirectory . '/*.jpg');
$photoFiles = array_merge($photoFiles, glob($randomDepartmentDirectory . '/*.jpeg'));
$photoFiles = array_merge($photoFiles, glob($randomDepartmentDirectory . '/*.png'));
$photoFiles = array_merge($photoFiles, glob($randomDepartmentDirectory . '/*.gif'));

// Select a random photo file
$randomPhoto = $photoFiles[array_rand($photoFiles)];

// Extract the person's name from the file name
$fileName = basename($randomPhoto);
$personName = str_replace('_', ' ', pathinfo($fileName, PATHINFO_FILENAME));

// Prepare the response as JSON
$response = [
  'personName' => $personName,
  'randomPhoto' => $randomPhoto
];

// Set the response headers
header('Content-Type: application/json');

// Output the response as JSON
echo json_encode($response);
?>