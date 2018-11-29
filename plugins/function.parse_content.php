<?php
/*
 * Smarty plugin
 * -------------------------------------------------------------
 * File:     function.parse_content.php
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

function smarty_function_parse_content($params, $template) {
	$content = isset($params['content']) ? $params['content'] : '';
	$processed_content = '';
	$extracted_elements = [];
	$extracted_scripts = [];

	if ($content) {

		libxml_use_internal_errors(true);

		$dom = new DOMDocument();
		$dom->preserveWhiteSpace = false;
		$dom->formatOutput = true;
		$dom->loadHTML($content);

		$xpath = new DOMXpath($dom);

		foreach($xpath->query('//script') as $element) {
			$element->parentNode->removeChild($element);

			$extracted_scripts[] = $element->ownerDocument->saveHTML($element);
		}

		foreach($xpath->query('//div[@class="extract-element-from-content"]') as $element) {
			$element->parentNode->removeChild($element);

			$extracted_elements_dom = new DOMDocument();

			foreach($element->childNodes as $child_node) {
				$extracted_elements_dom->appendChild($extracted_elements_dom->importNode($child_node, true));
			}

			$extracted_elements[] = $extracted_elements_dom->saveHTML();
		}

		$elements = $xpath->query('//body');
		if ($elements->length) {
			$body = $elements->item(0);
			foreach ($body->childNodes as $childNode) {
				$processed_content.= $body->ownerDocument->saveHTML($childNode);
			}
		} else {
			$processed_content = $content;
			$extracted_elements = [];
			$extracted_scripts = [];
		}

		libxml_clear_errors();
		libxml_use_internal_errors(false);

	}

	if (isset($params['assign_processed_content'])) {
		$template->assign($params['assign_processed_content'], $processed_content);
	}

	if (isset($params['assign_extracted_elements'])) {
		$template->assign($params['assign_extracted_elements'], $extracted_elements);
	}

	if (isset($params['assign_extracted_scripts'])) {
		$template->assign($params['assign_extracted_scripts'], $extracted_scripts);
	}
}