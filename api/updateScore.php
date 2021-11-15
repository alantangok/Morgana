<?php
ini_set('memory_limit', '1024M');

// database
require './config/config.php';

unset($data);

$conn = mysqlConnect();

$score = getgpc('score');
$walletAddress = getgpc('walletAddress');

if($walletAddress === 'guest'){
    die();
}

$sqlQuery = sqlUpdateOrInsert('contest_record', [
    'walletAddress' => getgpc('walletAddress'),
    'gamingDuration' => intval(getgpc('gamingDuration')),
    'score' => intval(getgpc('score')),
    'enemyKill' => intval(getgpc('enemyKill')),
    'ip' => getUserIP(),
]);

$rs = mysqlQuery($sqlQuery);

if ($rs->result === true) {
    echo 'db ok';
} else {
    echo 'db fail';
}

$rs = mysqlQuery("SELECT * FROM contest_leaderboard WHERE walletAddress = '{$walletAddress}'");

if ($rs->result->num_rows > 0) {
    $row = mysqli_fetch_all($rs->result, MYSQLI_ASSOC)[0];
    $highestScore = $row['highestScore'];
}else{
    $highestScore = 0;
}

if (intval(getgpc('score')) >= intval($highestScore)) {

    $sqlQuery = sqlUpdateOrInsert('contest_leaderboard', [
        'walletAddress' => getgpc('walletAddress'),
        'highestScore' => intval(getgpc('score')),
        'highestNFTAddress' => getgpc('highestNFTAddress'),
        'ip' => getUserIP(),
        'enemyKill' => intval(getgpc('enemyKill')),
        'gamingDuration' => intval(getgpc('gamingDuration')),
    ]);

    $rs = mysqlQuery($sqlQuery);

    if ($rs->result === true) {
        echo 'db ok';
    } else {
        echo 'db fail';
    }


}

function mysqlConnect()
{
    // Create connection
    $conn = new mysqli(mysql_servername, mysql_username, mysql_password, mysql_dbname);
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } else {
        return $conn;
    }
}

function mysqlQuery($query)
{
    $_this = new StdClass();
    $_this->conn = mysqlConnect();
    $_this->conn->set_charset("utf8mb4");
    $_this->query = $query;
    $_this->result = $_this->conn->query($_this->query);
    if ($_this->result === true) {
        $_this->insert_id = $_this->conn->insert_id;
    }
    $_this->conn->close();
    return $_this;
}

function sqlUpdateOrInsert($tableName, array $args = array())
{
    $const = 'constant';
    $valuesUpdate = '';

    if (count($args) > 0) {

        $fields = implode(",", array_keys($args));
        foreach (array_values($args) as $value) {
            if ($value === 'NULL' || $value === NULL) {
                $values[] = 'NULL';
            } elseif (is_array($value)) {
                $json = json_encode($value, JSON_NUMERIC_CHECK);
                $values[] = "'{$json}'";
            } else {
                $values[] = "'{$value}'";
            }
        }
        $values = implode(',', $values);
        foreach (array_keys($args) as $key) {
            $valuesUpdate .= "$key = VALUES($key),";
        }
        $valuesUpdate = rtrim($valuesUpdate, ',');
        $sql = <<<SQL
        INSERT INTO {$const('mysql_prefix')}$tableName ({$fields})
        VALUES ({$values})
        ON DUPLICATE KEY 
        UPDATE {$valuesUpdate}
SQL;
        return $sql;
    }

}


function getgpc($k, $type = 'GP')
{
    $type = strtoupper($type);
    switch ($type) {
        case 'G':
            $var = &$_GET;
            break;
        case 'P':
            $var = &$_POST;
            break;
        case 'C':
            $var = &$_COOKIE;
            break;
        default:
            if (isset($_GET[$k])) {
                $var = &$_GET;
            } else {
                $var = &$_POST;
            }
            break;
    }
    return isset($var[$k]) ? mysql_escape($var[$k]) : NULL;
}

function less_getgpc($k, $type = 'GP')
{
    $type = strtoupper($type);
    switch ($type) {
        case 'G':
            $var = &$_GET;
            break;
        case 'P':
            $var = &$_POST;
            break;
        case 'C':
            $var = &$_COOKIE;
            break;
        default:
            if (isset($_GET[$k])) {
                $var = &$_GET;
            } else {
                $var = &$_POST;
            }
            break;
    }
    return isset($var[$k]) ? $var[$k] : NULL;
}

function mysql_escape($string)
{
    return mysqli_real_escape_string(mysqlConnect(), $string);
}

function isJSON(...$args)
{
    json_decode(...$args);
    return (json_last_error() === JSON_ERROR_NONE);
}

function getUserIP($returnArray = false)
{
    foreach ([
                 'HTTP_CLIENT_IP',
                 'HTTP_X_FORWARDED_FOR',
                 'HTTP_X_FORWARDED',
                 'HTTP_X_CLUSTER_CLIENT_IP',
                 'HTTP_FORWARDED_FOR',
                 'HTTP_FORWARDED',
                 'REMOTE_ADDR'
             ] as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip); // just to be safe

//                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                if (filter_var($ip, FILTER_VALIDATE_IP) !== false) {

                    if ($returnArray == true) {
                        $ipList[] = [
                            'name' => $key,
                            'value' => $ip,
                        ];
                    } else {
                        return $ip;
                    }

                }
            }
        }
    }
    return $ipList ? $ipList : null;
}
