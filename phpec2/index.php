<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

echo json_encode(['deaths' => rand(1, 1000), 'casualties' => rand(1, 1000)]);