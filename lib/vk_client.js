VK = {};

VK.requestCredential = function (options, credentialRequestCompleteCallback) {

	if (!credentialRequestCompleteCallback && typeof options === 'function') {
		credentialRequestCompleteCallback = options;
		options = {};
	}

	var config = ServiceConfiguration.configurations.findOne({service: 'vk'});
	if (!config) {
		credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError("Service not configured"));
		return;
	}

	var credentialToken = Random.secret();
	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
	var display = mobile ? 'touch' : 'popup';
	var scope = '';

	if (config.scope) {
		scope = config.scope;
		if (options && options.requestPermissions) {
			scope = scope + ',';
		}
	}

	if (options && options.requestPermissions) {
		scope = scope + options.requestPermissions.join(',');
	}
	var loginStyle = OAuth._loginStyle('vk', config, options);

	var loginUrl =
		'https://oauth.vk.com/authorize' +
		'?client_id=' + config.appId +
		'&scope=' + scope +
		'&redirect_uri=' + Meteor.absoluteUrl('_oauth/vk?close=close', {replaceLocalhost: false}) +
		'&response_type=code' +
		'&display=' + display +
		'&state=' + OAuth._stateParam(loginStyle, credentialToken);

	//Oauth.initiateLogin(credentialToken, loginUrl, credentialRequestCompleteCallback);
	OAuth.launchLogin({
		loginService: "vk",
		loginStyle: loginStyle,
		loginUrl: loginUrl,
		credentialRequestCompleteCallback: credentialRequestCompleteCallback,
		credentialToken: credentialToken,
		popupOptions: {width: 900, height: 450}
	});
};
