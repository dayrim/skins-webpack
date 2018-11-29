<?php
/*
 * Smarty plugin
 * -------------------------------------------------------------
 * File:     function.inline_css.php
 * Type:     function
 * Name:     inline_css
 * Purpose:  Inline css from specific path (path starts from skin's root)
 * -------------------------------------------------------------
 */
/**
 * @param $params
 * @param $template
 * @return array
 */

function smarty_function_inline_css($params, $template) {
	$path = isset($params['path']) ? $params['path'] : '';
	$paths_to_replace = isset($params['paths_to_replace']) ? $params['paths_to_replace'] : [];

	$config     = Zend_Registry::get('config');
	$baseUrl    = isset($config->resources->frontController->baseUrl) ? $config->resources->frontController->baseUrl : '/';
	$template   = 'skins/' . $config->skin->current . '/';

	if ($path) {
		$file = trim(file_get_contents($config->skin->path . '/' . $config->skin->current . '/' . $path));

		if ($paths_to_replace) {
			foreach ($paths_to_replace as $search => $replace) {
				$file = str_replace($search, $baseUrl . $template . $replace, $file);
			}
		}

		return $file;
	}
}