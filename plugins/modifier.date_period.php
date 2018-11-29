<?php
/*
 * Smarty plugin
 * -------------------------------------------------------------
 * File:     modifier.date_period.php
 * Type:     modifier
 * Name:     date period
 * Purpose:  return range of time with 30 minutes step
 * -------------------------------------------------------------
 */
/**
 * @param $params
 * @param $template
 * @return array
 */

function smarty_modifier_date_period($params)
{
	$daterange = new DatePeriod(new DateTime('2012-08-31T00:00:00'), new DateInterval('PT30M'), new DateTime('2012-08-31T23:59:59'));

	return $daterange;
}
