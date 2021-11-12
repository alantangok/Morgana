<?php
ini_set('memory_limit', '1024M');

// database
define('mysql_servername', 'localhost');
define('mysql_dbname', 'morgana_game');
define('mysql_prefix', '');
define('mysql_username', 'morgana_game');
define('mysql_password', 'Lfe85XiCMYQJ6a');

$conn = mysqlConnect();
if(isJSON(less_getgpc('addressArray'))){
    $addressArray = json_decode(less_getgpc('addressArray'));
}

$returnArray = [];

foreach ($addressArray as $address) {
    unset($data);

    $address = mysql_escape($address);
    $rs = mysqlQuery("SELECT * FROM nft_raw_data WHERE mintAddress = '{$address}'");

    if ($rs->result->num_rows > 0) {
        $row = mysqli_fetch_all($rs->result, MYSQLI_ASSOC)[0];


        $returnArray[] = [
            'id' => $row['id'],
            'image' => $row['image'],
            'name' => $row['name'],
            'mintAddress' => $row['mintAddress'],
        ];
    }
}

echo json_encode($returnArray);


function getPage2($url)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
//    curl_setopt($ch, CURLOPT_COOKIEJAR, $COOKIEFILE);
//    curl_setopt($ch, CURLOPT_COOKIEFILE, $COOKIEFILE);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 120);
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);

    curl_setopt($ch, CURLOPT_URL, $url);
    $data = curl_exec($ch);

    return $data;
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