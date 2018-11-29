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

function smarty_function_file_exists($params, $template) {
	$path = isset($params['path']) ? $params['path'] : '';


	$config     = Zend_Registry::get('config');
//	$baseUrl    = isset($config->resources->frontController->baseUrl) ? $config->resources->frontController->baseUrl : '/';
//	$template   = 'skins/' . $config->skin->current . '/';

	$realPath = $config->skin->path . '/' . $config->skin->current . '/' . $path;

	return is_file($realPath);
//
//	if ($path) {
//		$file = trim(file_get_contents($config->skin->path . '/' . $config->skin->current . '/' . $path));
//		return file_exists($file);
//	}
}