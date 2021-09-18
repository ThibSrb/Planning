<?php
$res = array();
switch ($_SERVER["REQUEST_METHOD"]) {
    case "POST":
        $res = handleReq($_POST);
        break;
    case "GET":
        $res =handleReq($_GET);
        break;
    case "PUT":
        $res = handleReq($_PUT);
        break;
    default:
        $res["success"] = false;
}
header('Content-Type: application/json; charset=utf-8');
echo json_encode($res);


//function defs
function handleReq($args)
{
    $res = array();
    if (!empty($args["reqType"])) {
        switch ($args["reqType"]) {
            case "askSched":
                $res = askSched($args);
                break;
            default:
                $res["success"] = false;
        }
    } else {
        $res["success"] = false;
    }
    return $res;
}

function askSched($args)
{
    
    $res = array();
    if (!empty($args["schedUrl"])) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $args["schedUrl"]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $res["response"] = curl_exec($ch);
        $res["success"] = true;
    } else {
        $res["success"] = false;
        $res["errorMessage"] = "askSched : <schedUrl> must be defined";
    }
    return $res;
}