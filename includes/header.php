<?php
/**
 * Loan Anchor Header PHP Include
 * Usage: $currentPage = 'home'|'services'|'about'|'faqs'|'team'|'contact'; include 'includes/header.php';
 */
$currentPage = $currentPage ?? '';
$headerTpl = file_get_contents(__DIR__ . '/../components/header.html');
$headerTpl = str_replace([
    '{{NAV_HOME_ACTIVE}}',
    '{{NAV_SERVICES_ACTIVE}}',
    '{{NAV_ABOUT_ACTIVE}}',
    '{{NAV_FAQS_ACTIVE}}',
    '{{NAV_TEAM_ACTIVE}}',
    '{{NAV_CONTACT_ACTIVE}}',
], [
    ($currentPage === 'home' ? 'active' : ''),
    ($currentPage === 'services' ? 'active' : ''),
    ($currentPage === 'about' ? 'active' : ''),
    ($currentPage === 'faqs' ? 'active' : ''),
    ($currentPage === 'team' ? 'active' : ''),
    ($currentPage === 'contact' ? 'active' : ''),
], $headerTpl);
echo $headerTpl;

