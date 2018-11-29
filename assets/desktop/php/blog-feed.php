<?php

//error_reporting(0);
//ini_set('display_errors', 'Off');

$url = isset($_REQUEST['url']) ? strval(rtrim($_REQUEST['url'], '/')) : null;
$tag = isset($_REQUEST['tag']) && strval($_REQUEST['tag']) != 'null' ? strval($_REQUEST['tag']) : null;
$posts_limit = isset($_REQUEST['posts_limit']) ? intval($_REQUEST['posts_limit']) : 10;

$url .= '/feed/';

if ($tag) {
	$url .= '?tag=' . urlencode($tag);
}

$cache_expiration = 60 * 60;
$results = array();

header("Pragma: public");
header("Cache-Control: max-age=" . $cache_expiration . ", must-revalidate");
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $cache_expiration) . ' GMT');

if (!$url) {
	print json_encode(array());
	die();
}

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_HEADER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$xml = simplexml_load_string(curl_exec($curl), "SimpleXMLElement", LIBXML_NOCDATA);
curl_close($curl);

$posts_counter = 0;
foreach ($xml->channel->item as $item) {
	$id = null;
	if (preg_match('/p=(\d+)/', $item->guid, $m)) {
		$id = $m[1];
	}
	$newItem = new stdClass();
	$newItem->date = date('F d, Y', strtotime($item->pubDate));
	$newItem->id = $id;
	$newItem->url = (string)$item->link;
	$newItem->title = (string)$item->title;
	$newItem->text = strip_tags((string)$item->description);
	$newItem->author = null;
	$newItem->image = null;

	$results[] = $newItem;
	$posts_counter++;

	if ($posts_limit && $posts_counter == $posts_limit) break;
}

print json_encode($results);