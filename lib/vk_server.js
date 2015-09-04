VK = {};

OAuth.registerService('vk', 2, null, function (query) {
	var response = getTokenResponse(query);
	var accessToken = response.accessToken;
	var identity = getIdentity(accessToken);

	var serviceData = {
		accessToken: OAuth.sealSecret(accessToken),
		expiresAt: (+new Date) + (1000 * response.expiresIn)
	};

	var whitelisted = ['uid', 'nickname', 'first_name', 'last_name', 'sex', 'bdate', 'timezone', 'photo', 'photo_big', 'city', 'country'];

	var data = _.pick(identity, whitelisted);
	_.extend(serviceData, data);

	if (response.email) {
		serviceData.email = response.email;
	}
	serviceData.id = serviceData.uid;

	delete serviceData.uid;

	return {
		serviceData: serviceData,
		options: {
			profile: {
				name: (identity.first_name + ' ' + identity.last_name) || identity.nickname
			}
		}
	};
});


var getTokenResponse = function (query) {
	var config = ServiceConfiguration.configurations.findOne({service: 'vk'});
	if (!config) {
		throw new ServiceConfiguration.ConfigError("Service not configured");
	}

	try {
		var result = HTTP.post(
			"https://api.vk.com/oauth/access_token", {
				params: {
					client_id: config.appId,
					client_secret: OAuth.openSecret(config.secret),
					code: query.code,
					redirect_uri: Meteor.absoluteUrl("_oauth/vk?close=close")
				}
			}).content;
	} catch (err) {
		throw _.extend(new Meteor.Error("Failed to complete OAuth handshake with Vk. " + err.message),
			{response: err.response});
	}
	// Success!  Extract the vk access token and expiration
	// time from the response
	var response = JSON.parse(result);

	var accessToken = response.access_token;
	var expires = response.expires_in;

	if (!accessToken) {
		throw new Meteor.Error("Failed to complete OAuth handshake with vkontakte - can't find access token in HTTP response. " + result);
	}
	return {
		accessToken: accessToken,
		expiresIn: expires,
		email: response.email || false
	};
};

var getIdentity = function (accessToken) {
	try {
		var result = HTTP.get(
			"https://api.vk.com/method/users.get", {
				params: {
					access_token: accessToken,
					fields: 'uid, nickname, first_name, last_name, sex, bdate, timezone, photo, photo_big, city, country'
				}
			});
		return result.data.response.shift();
	} catch (err) {
		throw _.extend(new Meteor.Error("Failed to fetch identity from Vk. " + err.message),
			{response: err.response});
	}
};

VK.retrieveCredential = function (credentialToken, credentialSecret) {
	return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
