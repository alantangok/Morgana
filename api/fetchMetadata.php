<?php
ini_set('memory_limit', '1024M');

// database
define('mysql_servername', 'localhost');
define('mysql_dbname', 'morgana_game');
define('mysql_prefix', '');
define('mysql_username', 'morgana_game');
define('mysql_password', 'Lfe85XiCMYQJ6a');

require "./mintsList.php";

foreach ($NFTMintsList as $address) {
    unset($data);

    $data = getPage2('https://api-mainnet.magiceden.io/rpc/getNFTByMintAddress/' . $address);
    $metadata_parsed = json_decode($data);
    $name = $metadata_parsed->results->title;
    $mintAddress = $metadata_parsed->results->mintAddress;
    $seq = $metadata_parsed->results->attributes[0]->value;
    $background = $metadata_parsed->results->attributes[1]->value;
    $body = $metadata_parsed->results->attributes[2]->value;
    $mouth = $metadata_parsed->results->attributes[3]->value;
    $eyes = $metadata_parsed->results->attributes[4]->value;
    $hair = $metadata_parsed->results->attributes[5]->value;
    $outfit = $metadata_parsed->results->attributes[6]->value;
    $accessory = $metadata_parsed->results->attributes[7]->value;
    $holdings = $metadata_parsed->results->attributes[8]->value;
    $owner = $metadata_parsed->results->owner;
    $image = $metadata_parsed->results->img;

    $conn = mysqlConnect();

    $sqlQuery = sqlUpdateOrInsert('nft_raw_data', array(
        'id' => $seq,
        'name' => $name,
        'owner' => $owner,
        'image' => $image,
        'mintAddress' => $mintAddress,
        'background' => $background,
        'body' => $body,
        'mouth' => $mouth,
        'eyes' => $eyes,
        'hair' => $hair,
        'outfit' => $outfit,
        'accessory' => $accessory,
        'holdings' => $holdings,
        'NFT_data' => $data,

    ));

    $rs = mysqlQuery($sqlQuery);

    if ($rs->result === true) {
        echo 'db ok';
    } else {
        echo 'db fail';
    }

}

echo 123;


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

