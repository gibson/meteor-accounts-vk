Package.describe({
	summary: "Login service for Vk accounts (https://vk.com)",
	version: "0.0.1",
	git: "https://github.com/gibson/meteor-accounts-vk",
	name: "gibson:accounts-vk"
});

Package.on_use(function (api) {
	api.versionsFrom('METEOR@0.9.0');
	api.use([
		'accounts-base',
		'accounts-oauth',
		'service-configuration',
		'oauth2',
		'oauth'
	]);
	api.use([
		'http'
	], 'server');

	api.use([
		'underscore',
		'templating',
		'random'
	], 'client');

	api.addFiles("lib/accounts_vk.js");
	api.addFiles(['lib/vk_styles.css', 'lib/vk_client.js'], 'client');
	api.addFiles('lib/vk_server.js', 'server');
});
