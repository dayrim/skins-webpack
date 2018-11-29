<?php
/*
 * Smarty plugin
 * -------------------------------------------------------------
 * File:     function.parse_descr.php
 * Type:     function
 * Name:     parse_content
 * Purpose:  Parse content
 * -------------------------------------------------------------
 */
/**
 * @param $params
 * @param $template
 * @return array
 */

function smarty_function_parse_descr($params, $template) {
	$content = isset($params['content']) ? $params['content'] : '';
	$widgets = isset($params['widgets']) ? $params['widgets'] : [];
	$truncate = isset($params['truncate']) ? $params['truncate'] : null;
	$processed_descr = '';
	$extracted_widgets = [];

	if ($content) {

		$pattern = '/\{widget\sname="([^"]*)"(?:\s\w+="[^"]*")*\s*\}/i';
		preg_match_all($pattern, $content, $matches);

		if (count($widgets) && isset($matches[0]) && is_array($matches[0]) && count($matches[0])) {
			foreach ($matches[0] as $ind => $item) {
				$name = $matches[1][$ind] ?? null;
				if ($name && in_array($name, $widgets)) {
					if (!isset($extracted_widgets[$matches[1][$ind]])) {
						$extracted_widgets[$matches[1][$ind]] = [];
					}
					$extracted_widgets[$matches[1][$ind]][] = $item;

					$content = str_replace($item, '', $content);
				}
			}
		}

		libxml_use_internal_errors(true);

		$dom = new DOMDocument();
		$dom->preserveWhiteSpace = false;
		$dom->formatOutput = true;

		$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));

		$xpath = new DOMXpath($dom);

		$extracted_widgets[] = '';

		$elements = $xpath->query('//body');
		if ($elements->length) {
			$body = $elements->item(0);
			foreach ($body->childNodes as $childNode) {
				if ($childNode->textContent && ($text = trim($childNode->textContent))) {
					if ($truncate) {
						$processed_descr.= substr(trim(html_entity_decode($text)), 0, $truncate);
					} else {
						$processed_descr.= trim(html_entity_decode($text));
					}
					break;
				}
			}
		} else {
			$processed_descr = $content;
			$extracted_widgets = [];
		}

		libxml_clear_errors();
		libxml_use_internal_errors(false);

	}

	if (isset($params['assign_processed_descr'])) {
		$template->assign($params['assign_processed_descr'], $processed_descr);
	}

	if (isset($params['assign_extracted_widgets'])) {
		$template->assign($params['assign_extracted_widgets'], $extracted_widgets);
	}
}