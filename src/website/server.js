const express = require('express');
const url = require('url');
const path = require('path');
const fs = require('fs');
const discord = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const ejs = require('ejs');
const passport = require('passport');
const bodyParser = require('body-parser');
const Strategy = require('passport-discord').Strategy;
const botConfig = require('../data/config.json');
const version = require('../../package.json').version;
const vdjs = require('../../package.json').dependencies['discord.js'];
const vnjs = require('../../package.json').engines.node;
const settings = require('./settings.json');
const logger = require('silly-logger');
const favicon = require('serve-favicon');
const fetch = require('node-fetch');
const compression = require('compression');
const https = require('https');
const http = require('http');


module.exports = async client  => {

	try {
	// website config backend
	const app = express();
	const session = require('express-session');
	const MemoryStore = require("memorystore")(session);

	// initialize discord login
	passport.serializeUser((user, done) => done(null, user));
	passport.deserializeUser((obj, done) => done(null, obj));
	passport.use(new Strategy({
		clientID: settings.config.clientID,
		clientSecret: settings.config.secret,
		callbackURL: settings.config.callback,
		scope: ["identify", "guilds", "guilds.join"],
	},
	(accessToken, refreshToken, profile, done) => {
		process.nextTick(()=>done(null, profile));
	},
	));

	app.use(session({
		store: new MemoryStore({ checkPeriod: 3600000 }), // oturum sürelerinin kaydedileceği süre
		secret: `SİFRE`,//şifre
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 3600000 // oturum süresini 15 dk olarak belirleyin (milisaniye cinsinden)
		  }
	}));

	// middleware
	app.use(passport.initialize());
	app.use(passport.session());

	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "./views"));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true,
	}));
	app.use(express.json());
	app.use(express.urlencoded({
		extended: true,
	}));

	app.use(favicon(path.join(__dirname, 'public/img', 'botçuk logo.png')));
	
  
	// compression
	app.use(compression());

	/*
	// http isteklerini https e yönlendiriyor
	app.use(function(req, res, next) {
		if(!req.secure) {
	  return res.redirect(['https://', req.get('Host'), req.url].join(''));
	}
	next();
  	});
	*/

	// loading public
	app.use('/public', express.static(__dirname + '/public'));

	const checkAuth = (req, res, next) => {
		if (req.isAuthenticated()) return next();
		req.session.backURL = req.url;
		res.redirect("/login");
	};

	app.get("/login", (req, res, next) => {
		if (req.session.backURL) {
			// eslint-disable-next-line no-self-assign
			req.session.backURL = req.session.backURL;
		} else if (req.headers.referer) {
			const parsed = url.parse(req.headers.referer);
			if (parsed.hostname == app.locals.domain) {
				req.session.backURL = parsed.path;
			}
		} else {
			req.session.backURL = "/";
		}
		next();
	}, passport.authenticate("discord", { prompt: null }));

	app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), async (req, res) => {
		  const channel = client.channels.cache.get('1154139861939408906');
		  const userr = req.isAuthenticated() ? req.user : null
		  const embed = new EmbedBuilder()
			.setColor('#0099ff') 
			.setTitle(`${userr.username} Siteye Giriş Yaptı`) 
			.setAuthor({ name: `${userr.username}`, iconURL: ` ${userr.avatar ? `https://cdn.discordapp.com/avatars/${userr.id}/${userr.avatar}.webp?size=512`:`https://cdn.discordapp.com/icons/792839772980772876/71bea58773dff9b56ba67f97259cd038?size=256`}` }) // embed mesajının yazarını ayarlıyoruz
			.addFields( { name: 'Kullanıcı', value: `<@${userr.id}> - ${userr.id}` }) 
			.addFields( { name: 'Dil', value:` ${getUserLocale(req.user.locale)}` }) 
			.setThumbnail(`${userr.avatar ? `https://cdn.discordapp.com/avatars/${userr.id}/${userr.avatar}.webp?size=512`:`https://cdn.discordapp.com/icons/792839772980772876/71bea58773dff9b56ba67f97259cd038?size=256`}`) // embed mesajının küçük resmini ayarlıyoruz
			.setFooter({text: `Botçuk`, iconURL: client.user.displayAvatarURL()})
			.setTimestamp(); 
			await channel.send({embeds: [embed]})

			function getUserLocale(locale) {
				switch (locale) {
					case 'tr':
					  return '🇹🇷 Türkçe';
					case 'en':
					  return '🇬🇧 İngilizce';
					case 'fr':
					  return '🇫🇷 Fransızca';
					case 'de':
					  return '🇩🇪 Almanca';
					case 'es':
					  return '🇪🇸 İspanyolca';
					case 'ar':
					  return '🇸🇦 Arapça';
					case 'zh':
					  return '🇨🇳 Çince';
					case 'ru':
					  return '🇷🇺 Rusça';
					case 'pt':
					  return '🇵🇹 Portekizce';
					case 'it':
					  return '🇮🇹 İtalyanca';
					case 'hi':
					  return '🇮🇳 Hintçe';
					case 'ja':
					  return '🇯🇵 Japonca';
					case 'ko':
					  return '🇰🇷 Korece';
					case 'nl':
					  return '🇳🇱 Hollandaca';
					case 'pl':
					  return '🇵🇱 Lehçe';
					case 'sv':
					  return '🇸🇪 İsveççe';
					case 'el':
					  return '🇬🇷 Yunanca';
					case 'he':
					  return '🇮🇱 İbranice';
					case 'fa':
					  return '🇮🇷 Farsça';
					case 'th':
					  return '🇹🇭 Tayca';
					case 'vi':
					  return '🇻🇳 Vietnamca';
					case 'id':
					  return '🇮🇩 Endonezyaca';
					case 'ro':
					  return '🇷🇴 Romence';
					case 'hu':
					  return '🇭🇺 Macarca';
					case 'cs':
					  return '🇨🇿 Çekçe';
					case 'fi':
					  return '🇫🇮 Fince';
					case 'da':
					  return '🇩🇰 Danca';
					case 'no':
					  return 'Norveşçe';
						default:
						return '🇬🇧 İngilizce';//varsayılan değer ingilizce
				  }
			  }
		res.redirect("/dashboard");
	});

	app.get("/logout", (req, res, next) => {
        req.session.destroy((err) => {
            if (err) { return next(err); }
            res.redirect("/");
        });
    });


	app.get("/dashboard", async (req, res) => {
        if (!req.isAuthenticated() || !req.user) {
			return res.redirect("/login");
		}
        if (!req.user.guilds) {
			return res.redirect("/?error=" + encodeURIComponent("Lonca bilgisi alınamıyor."));
		}


		const html = await ejs.renderFile("./src/website/views/dashboard/dashboard.ejs", {
			req: req,
            user: req.isAuthenticated() ? req.user : null,
            bot: client,
            Permissions: discord.PermissionsBitField,
            botconfig: settings.website,
            callback: settings.config.callback,
			async: true,
		});

		res.send(html);
	});


	app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
 	const guild = await client.guilds.cache.get(req.params.guildID);
 	if (!guild) return res.redirect("/dashboard/?error=" + encodeURIComponent("Henüz bu Sunucuya eklenmiş değilim, lütfen önce beni ekleyin!"));
 	let member = guild.members.cache.get(req.user.id);
 	if (!member) {
 	try {
 	member = await guild.members.fetch(req.user.id);
 	} catch {
 	// no
 		}
 	}
 	if (!member) return res.redirect("/?error=" + encodeURIComponent("Lütfen giriş yapın! / Sunucuya tekrar katılın!"));
 	if (!member.permissions.has(discord.PermissionsBitField.Flags.Administrator)) return res.redirect("/dashboard/?error=" + encodeURIComponent("Bu sunucucda yönetci yetkiniz bulunmuyor"));
 	if (!req.isAuthenticated() || !req.user) return res.redirect("/login");

 	// Sunucu sahibinin id ve ismini al
 	// ownerID ve ownerName değişkenlerini try bloğu dışında tanımla
 	let ownerID;
 	let ownerName;
 	// guild.fetchOwner metoduyla sunucu sahibini çek
 	try {
   	let owner = await guild.fetchOwner();
   	ownerID = owner.user.id;
   	ownerName = owner.user.username;
 	} catch (error) {
   	// Hata oluşursa konsola yaz
   	console.error(error);
   	ownerID = "Bilinmiyor";
   	ownerName = "Bilinmiyor";
 		}

 		const html = await ejs.renderFile("./src/website/views/dashboard/settings.ejs", {
 		req: req,
 		user: req.isAuthenticated() ? req.user : null,
 		guild: guild,
 		bot: client,
 		Permissions: discord.PermissionsBitField,
 		botconfig: settings.website,
 		callback: settings.config.callback,
 		// ownerID ve ownerName değişkenlerini de parametre olarak ekle
 		ownerID: ownerID,
 		ownerName: ownerName,
 		async: true,
 			});
 		res.send(html);
 	});


	app.post("/dashboard/:guildID", checkAuth, async (req, res) => {
		const guild = await client.guilds.cache.get(req.params.guildID);
		if (!guild) return res.redirect("/?error=" + encodeURIComponent("Henüz bu sunucuda değilim, lütfen önce beni ekleyin!"));
        let member = guild.members.cache.get(req.user.id);
		if (!member) {
			try {
				member = await guild.members.fetch(req.user.id);
			} catch {
				// no
			}

		}
		
		if (!member) return res.redirect("/?error=" + encodeURIComponent("Lütfen giriş yapın! / Sunucu tekrar katılın!"));
		if (!member.permissions.has(discord.PermissionsBitField.Flags.Administrator)) return res.redirect("/?error=" + encodeURIComponent("O sunucuyu yönetmenize izin verilmiyor!"));
		if (!req.isAuthenticated() || !req.user) return res.redirect("/login");

		// oto kayıt sistemi 
		if (req.body["autho-register-settings"]) {
			const dbClient = client.dbClient;
			const db = dbClient.db("botcuk");
			const collection = db.collection("autho-register");
			const filter = {
				_id: guild.id,
			};
			let result = await collection.findOne(filter);
			if (!result) {
				const doc = {
					"_id": guild.id,
					"channelId": "unset",
					"channelId2": "unset",
					"role": [false, "unset"],
					"role2": [false, "unset"],
					"enabled": false,
				};
				await collection.insertOne(doc);
			}
			result = await collection.findOne(filter);
			if (req.body["autho-register-settings"]) {
				switch (req.body["autho-register-settings"]) {
					case "off": {
						const updateDocument = {
							$set: {
								"enabled": false,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
					case "on": {
						const updateDocument = {
							$set: {
								"enabled": true,
							},
						};
						await collection.updateOne(result, updateDocument);
						return res.redirect(`/dashboard/${guild.id}/registerautho`);
					}
				}
			}
		}
		//bitiş
		// özel bot kontrol
		if (req.body["ozelBot-settings"]) {
			const dbClient = client.dbClient;
			const db = dbClient.db("botcuk");
			const collection = db.collection("ozelBot");
			const filter = {
				_id: guild.id,
			};
			let result = await collection.findOne(filter);
			if (!result) {
				const doc = {
					"_id": guild.id,
					"enabled": false,
				};
				await collection.insertOne(doc);
			}
			result = await collection.findOne(filter);
			if (req.body["ozelBot-settings"]) {
				switch (req.body["ozelBot-settings"]) {
					case "off": {
						const updateDocument = {
							$set: {
								"enabled": false,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
					case "on": {
						const updateDocument = {
							$set: {
								"enabled": true,
							},
						};
						await collection.updateOne(result, updateDocument);
						return res.redirect(`/dashboard/${guild.id}/access`);
					}
				}
			}
		}
		//bitiş
		// gelişmiş kayıt sistemi
		if (req.body["kayitSistem-Ayar"]) {
			const dbClient = client.dbClient;
			const db = dbClient.db("botcuk");
			const collection = db.collection("kayit");
			const filter = {
				_id: guild.id,
			};
			let result = await collection.findOne(filter);
			if (!result) {
				const doc = {
					"_id": guild.id,
					"channelId": "unset",
					"channelId2": "unset",
					"headline": "unset",
					"message": "unset",
					"thumbnail": false,
					"image": [false, "unset"],
					"color": "#618eb1",
					"headline2": "unset",
					"message2": "unset",
					"thumbnail2": false,
					"image2": [false, "unset"],
					"color2": "#618eb1",
					"dm": [false, "unset"],
					"role": [false, "unset"],
					"role2": [false, "unset"],
					"role3": [true, "unset"],
					"role4": [true, "unset"],
					"role5": [true, "unset"],
					"otoRol": true,
					"age": false,
					"sembol": [false, "unset"],
					"tag": [false, "unset"],
					"enabled": false,
				};
				await collection.insertOne(doc);
			}
			result = await collection.findOne(filter);
			if (req.body["kayitSistem-Ayar"]) {
				switch (req.body["kayitSistem-Ayar"]) {
					case "off": {
						const updateDocument = {
							$set: {
								"enabled": false,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
					case "on": {
						const updateDocument = {
							$set: {
								"enabled": true,
							},
						};
						await collection.updateOne(result, updateDocument);
						return res.redirect(`/dashboard/${guild.id}/kayit`);
					}
				}
			}
		}
		//bitiş
				// Güvenlik sistemi
				if (req.body["guvenlikSistem-Ayar"]) {
					const dbClient = client.dbClient;
					const db = dbClient.db("botcuk");
					const collection = db.collection("guvenlik");
					const filter = {
						_id: guild.id,
					};
					let result = await collection.findOne(filter);
					if (!result) {
						const doc = {
							"_id": guild.id,
							"channelId": "unset",
							"channelId2": "unset",
							"message": "unset",
							"message2": "unset",
							"enabled": false,
							"botk": false,
							"sunucu": false,
							"rol": false,
							"kanal": false,
							"url": false,
						};
						await collection.insertOne(doc);
					}
					result = await collection.findOne(filter);
					if (req.body["guvenlikSistem-Ayar"]) {
						switch (req.body["guvenlikSistem-Ayar"]) {
							case "off": {
								const updateDocument = {
									$set: {
										"enabled": false,
									},
								};
								await collection.updateOne(result, updateDocument);
								break;
							}
							case "on": {
								const updateDocument = {
									$set: {
										"enabled": true,
									},
								};
								await collection.updateOne(result, updateDocument);
								return res.redirect(`/dashboard/${guild.id}/guvenlik`);
							}
						}
					}
				}
				//bitiş
						// otorol sistemi
		if (req.body["otoRolSistem-Ayar"]) {
			const dbClient = client.dbClient;
			const db = dbClient.db("botcuk");
			const collection = db.collection("otoRol");
			const filter = {
				_id: guild.id,
			};
			let result = await collection.findOne(filter);
			if (!result) {
				const doc = {
					"_id": guild.id,
					"role": [false, "unset"],
					"role2": [false, "unset"],
					"enabled": false,
					"userRol": false,
					"botRol": false,
				};
				await collection.insertOne(doc);
			}
			result = await collection.findOne(filter);
			if (req.body["otoRolSistem-Ayar"]) {
				switch (req.body["otoRolSistem-Ayar"]) {
					case "off": {
						const updateDocument = {
							$set: {
								"enabled": false,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
					case "on": {
						const updateDocument = {
							$set: {
								"enabled": true,
							},
						};
						await collection.updateOne(result, updateDocument);
						return res.redirect(`/dashboard/${guild.id}/otorol`);
					}
				}
			}
		}
		//bitiş
				// gelişmiş kayıt sistemi
				if (req.body["otoYanitSistem-Ayar"]) {
					const dbClient = client.dbClient;
					const db = dbClient.db("botcuk");
					const collection = db.collection("otoyanit");
					const filter = {
						_id: guild.id,
					};
					let result = await collection.findOne(filter);
					if (!result) {
						const doc = {
							"_id": guild.id,
							"message": "unset",
							"enabled": false,
							"selam": false,
							
						};
						await collection.insertOne(doc);
					}
					result = await collection.findOne(filter);
					if (req.body["otoYanitSistem-Ayar"]) {
						switch (req.body["otoYanitSistem-Ayar"]) {
							case "off": {
								const updateDocument = {
									$set: {
										"enabled": false,
									},
								};
								await collection.updateOne(result, updateDocument);
								break;
							}
							case "on": {
								const updateDocument = {
									$set: {
										"enabled": true,
									},
								};
								await collection.updateOne(result, updateDocument);
								return res.redirect(`/dashboard/${guild.id}/otoyanit`);
							}
						}
					}
				}
				//bitiş
    	// kodunuz burada



		const html = await ejs.renderFile("./src/website/views/dashboard/settings.ejs", {
			req: req,
            user: req.isAuthenticated() ? req.user : null,
			guild: guild,
            bot: client,
			Permissions: discord.PermissionsBitField,
			// ownerID ve ownerName değişkenlerini de parametre olarak ekle
			ownerID: ownerID,
			ownerName: ownerName,
            botconfig: settings.website,
            callback: settings.config.callback,
			async: true,
		});
		res.send(html);
    });

	app.get("/dashboard/:guildID/:botFunction", checkAuth, async (req, res) => {
		const guild = await client.guilds.cache.get(req.params.guildID);
		const botFunction = req.params.botFunction;
		if (!guild) return res.redirect("/?error=" + encodeURIComponent("Henüz bu Loncada değilim, lütfen önce beni ekleyin!"));
        let member = guild.members.cache.get(req.user.id);
		if (!member) {
			try {
				member = await guild.members.fetch(req.user.id);
			} catch {
				// no
			}
		}
		if (!member) return res.redirect("/?error=" + encodeURIComponent("Oturum süreniz doldu lütfen tekrar giriş yapınız."));
		if (!member.permissions.has(discord.PermissionsBitField.Flags.Administrator)) return res.redirect("/?error=" + encodeURIComponent("İstediğiniz sunucuya erişiminiz bulunmuyor !"));
		if (!req.isAuthenticated() || !req.user) return res.redirect("/login");

		const functions = fs.readdirSync('src/website/views/dashboard/functions');
		for (let i = 0; i < functions.length; i++) {
			const filename = functions[i].split(".")[0];
			functions[i] = filename;
		}
		if (!functions.includes(botFunction)) {
	switch (botFunction) {
		case "registerautho":
			sistem = "Otamatik kayıt sistemi";
			break;
		case "kayit":
			sistem = "Gelişmiş kayıt sistemi";
			break;
		case "access":
			sistem = "Özel bot sistemi";
			break;
			case "guvenlik":
			sistem = "Güvenlik sistemi";
			break;
		case "otorol":
			sistem = "Otomatik rol sistemi";
			break;
		case "otoyanit":
			sistem = "Otomatik yanıt sistemi";
			break;
		default:
			sistem = "Bilinmeyen sistem";
	}
	if (sistem === "Bilinmeyen sistem") {
		return res.redirect(`${settings.website.domain}/dashboard/?error=` + encodeURIComponent(`Olmayan bir sayfaya girmeye çalıştınız.`));
	} else {
		return res.redirect(`${settings.website.domain}/dashboard/?error=` + encodeURIComponent(`${sistem}  şuanda bakımda lütfen daha sonra tekrar deneyin.`));
	}
}

		// Sunucu sahibinin id ve ismini al
 		// ownerID ve ownerName değişkenlerini try bloğu dışında tanımla
 		let ownerID;
 		let ownerName;
 		// guild.fetchOwner metoduyla sunucu sahibini çek
 		try {
   		let owner = await guild.fetchOwner();
  		ownerID = owner.user.id;
   		ownerName = owner.user.username;
 		} catch (error) {
   		// Hata oluşursa konsola yaz
   		console.error(error);
   		ownerID = "Bilinmiyor";
   		ownerName = "Bilinmiyor";
 		}
		//bitiş

		const html = await ejs.renderFile(`./src/website/views/dashboard/functions/${botFunction}.ejs`, {
			req: req,
			res: res,
            user: req.isAuthenticated() ? req.user : null,
			guild: guild,
            bot: client,
            Permissions: discord.PermissionsBitField,
			// ownerID ve ownerName değişkenlerini de parametre olarak ekle
			ownerID: ownerID,
			ownerName: ownerName,
            botconfig: settings.website,
            callback: settings.config.callback,
			async: true,
		});
		res.send(html);
    });

	app.post("/dashboard/:guildID/:botFunction", checkAuth, async (req, res) => {
		const guild = await client.guilds.cache.get(req.params.guildID);
		const botFunction = req.params.botFunction;
		if (!guild) return res.redirect("/?error=" + encodeURIComponent("Henüz bu sunucuda değilim, lütfen önce beni ekleyin!"));
        let member = guild.members.cache.get(req.user.id);
		if (!member) {
			try {
				member = await guild.members.fetch(req.user.id);
			} catch {
				// no
			}
		}
		if (!member) return res.redirect("/?error=" + encodeURIComponent("Oturum süreniz doldu lütfen tekrar giriş yapınız"));
		if (!member.permissions.has(discord.PermissionsBitField.Flags.Administrator)) return res.redirect("/?error=" + encodeURIComponent("İstediğiniz sunucuya erişiminiz bulunmuyor !"));
		if (!req.isAuthenticated() || !req.user) return res.redirect("/login");

		const functions = fs.readdirSync('src/website/views/dashboard/functions');
		for (let i = 0; i < functions.length; i++) {
			const filename = functions[i].split(".")[0];
			functions[i] = filename;
		}
		if (!functions.includes(botFunction)) {
			switch (botFunction) {
				case "registerautho":
					sistem = "Otamatik kayıt sistemi";
					break;
				case "kayit":
					sistem = "Gelişmiş kayıt sistemi";
					break;
				case "access":
					sistem = "Özel bot sistemi";
					break;
				case "guvenlik":
					sistem = "Güvenlik sistemi";
					break;
				case "otorol":
					sistem = "Otomatik rol sistemi";
					break;
				case "otoyanit":
					sistem = "Otomatik yanıt sistemi";
					break;
				default:
					sistem = "Bilinmeyen sistem";
			}
			if (sistem === "Bilinmeyen sistem") {
				return res.redirect(`${settings.website.domain}/dashboard/?error=` + encodeURIComponent(`Olmayan bir sayfaya girmeye çalıştınız.`));
			} else {
				return res.redirect(`${settings.website.domain}/dashboard/?error=` + encodeURIComponent(`${sistem}  şuanda bakımda lütfen daha sonra tekrar deneyin.`));
			}
		}

	
		//oto kayıt sistemi 
		if (botFunction == "registerautho") {
		const dbClient = client.dbClient;
		const db = dbClient.db("botcuk");
		const collection = db.collection("autho-register");
		const filter = {
			_id: guild.id,
		};
		let result = await collection.findOne(filter);
		if (!result) {
		const doc = {
						"_id": guild.id,
						"channelId": "unset",
						"channelId2": "unset",
						"role": [true, "unset"],
						"role2": [true, "unset"],
		};
		await collection.insertOne(doc);
		}
		result = await collection.findOne(filter);
		if (req.body.authoRegister) {
			switch (req.body.authoRegister) {
			case "off": {
			const updateDocument = {
				$set: {
				"enabled": false,
				},
			};
			await collection.updateOne(result, updateDocument);
			break;
		}
		case "on": {
			const updateDocument = {
				$set: {
				"enabled": true,
				},
				};
				await collection.updateOne(result, updateDocument);
				break;
				}
			}
		} else if (!req.body.authoRegister) {
		const forcedUpdateDocument = {
		$set: {
			"channelId": req.body.welcomeChannel,
			"channelId2": req.body.welcomeChannel2 ,

		},
		};
		await collection.updateMany(filter, forcedUpdateDocument);
			
			//sistem açık ise
		if (req.body.welcomeRoleCheck == "true") {
		const updateDocument = {
			$set: {
					"role": [true, req.body.welcomeRole],
					},
				};
			await collection.updateOne(filter, updateDocument);
		} else {
						const updateDocument = {
							$set: {
								"role": [false, req.body.welcomeRole],
							},
						};
						await collection.updateOne(filter, updateDocument);
					}
			
					if (req.body.welcomeRoleCheck2 == "true") {
						const updateDocument = {
							$set: {
								"role2": [true, req.body.welcomeRole2],
							},
						};
						await collection.updateOne(filter, updateDocument);
					} else {
						const updateDocument = {
							$set: {
								"role2": [false, req.body.welcomeRole2],
							},
						};
						await collection.updateOne(filter, updateDocument);
					}
				}
					}
					//bitiş
			//özel bot sistemi 
			if (botFunction == "access") {
				const dbClient = client.dbClient;
				const db = dbClient.db("botcuk");
				const collection = db.collection("ozelBot");
				const filter = {
					_id: guild.id,
				};
				let result = await collection.findOne(filter);
				if (!result) {
				const doc = {
								"_id": guild.id,
				};
				await collection.insertOne(doc);
				}
				result = await collection.findOne(filter);
				if (req.body.ozelBot) {
					switch (req.body.ozelBot) {
					case "off": {
					const updateDocument = {
						$set: {
						"enabled": false,
						},
					};
					await collection.updateOne(result, updateDocument);
					break;
				}
				case "on": {
					const updateDocument = {
						$set: {
						"enabled": true,
						},
						};
						await collection.updateOne(result, updateDocument);
						break;
						}
					}
				} else if (!req.body.ozelBot) {
				await collection.updateMany(filter, forcedUpdateDocument);
			}
		}
							
							//bitiş

					// gelişmiş kayit sistemi
		if (botFunction == "kayit") {
			const dbClient = client.dbClient;
			const db = dbClient.db("botcuk");
			const collection = db.collection("kayit");
			const filter = {
				_id: guild.id,
			};
			let result = await collection.findOne(filter);
			if (!result) {
				const doc = {
					"_id": guild.id,
					"channelId": "unset",
					"channelId2": "unset",
					"headline": "${serverName} Sunucusuna hoş geldin",
					"message": "> **• Hesap Adı:**\n>  (${memberMention}  - \`${memberId}\`)\n> **• Hesap Kurulum Tarihi:**\n>    ${accountData} \n> **• Avatar:**\n>  ${avatar}",
					"thumbnail": false,
					"image": [false, "unset"],
					"color": "#618eb1",
					"headline2": " <a:emoji_51:1033804657698541668>",
					"message2": "Aramıza hoş geldin ( ${memberName} - ${memberMention} )  seninle beraber ${memberNumber} kişi olduk.",
					"thumbnail2": false,
					"image2": [false, "unset"],
					"color2": "#618eb1",
					"dm": [false, "> **• Hesap Adı:**\n>  (${memberMention}  - \`${memberId}\`)\n> **• Hesap Kurulum Tarihi:**\n>    ${accountData} \n> **• Avatar:**\n>  ${avatar}"],
					"role": [false, "unset"],
					"role2": [false, "unset"],
					"role3": [true, "unset"],
					"role4": [true, "unset"],
					"role5": [true, "unset"],
					"otoRol": true,
					"age": false,
					"sembol": [false, "unset"],
					"tag": [false, "unset"],
					"enabled": false,
				};
				await collection.insertOne(doc);
			}
			result = await collection.findOne(filter);
			if (req.body.kayitSistem) {
				switch (req.body.kayitSistem) {
					case "off": {
						const updateDocument = {
							$set: {
								"enabled": false,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
					case "on": {
						const updateDocument = {
							$set: {
								"enabled": true,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
				}
			} else if (!req.body.kayitSistem) {
				// thumbnail 1
				if (req.body.welcomeThumbnail == "true") {
					req.body.welcomeThumbnail = true;
				} else {
					req.body.welcomeThumbnail = false;
				}
				// thumbnail 2
				if (req.body.welcomeThumbnail2 == "true") {
					req.body.welcomeThumbnail2 = true;
				} else {
					req.body.welcomeThumbnail2 = false;
				}
				// oto rol
				if (req.body.otoRol == "true") {
					req.body.otoRol = true;
				} else {
					req.body.otoRol = false;
				}
				// yaşla kayıt
				if (req.body.age == "true") {
					req.body.age = true;
				} else {
					req.body.age = false;
				}
				const forcedUpdateDocument = {
					$set: {
						"channelId": req.body.welcomeChannel,
						"headline": req.body.welcomeEmbedHeadline,
						"message": req.body.welcomeEmbedText,
						"thumbnail": req.body.welcomeThumbnail,
						"color": req.body.welcomeEmbedColor,
						"channelId2": req.body.welcomeChannel2,
						"headline2": req.body.welcomeEmbedHeadline2,
						"message2": req.body.welcomeEmbedText2,
						"thumbnail2": req.body.welcomeThumbnail2,
						"color2": req.body.welcomeEmbedColor2,
						"otoRol" : req.body.otoRol,
						"age"    : req.body.age,
					},
				};
				await collection.updateMany(filter, forcedUpdateDocument);
				// image 1
				if (req.body.welcomeImageCheck == "true") {
					const updateDocument = {
						$set: {
							"image": [true, req.body.welcomeImageURL],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"image": [false, req.body.welcomeImageURL],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// image 2
				if (req.body.welcomeImageCheck2 == "true") {
					const updateDocument = {
						$set: {
							"image2": [true, req.body.welcomeImageURL2],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"image2": [false, req.body.welcomeImageURL2],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// tag
				if (req.body.tagCheck == "true") {
					const updateDocument = {
						$set: {
							"tag": [true, req.body.tagURL],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"tag": [false, req.body.tagURL],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// sembol
				if (req.body.sembolCheck == "true") {
					const updateDocument = {
						$set: {
							"sembol": [true, req.body.sembolURL],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"sembol": [false, req.body.sembolURL],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// dm 
				if (req.body.welcomeDmCheck == "true") {
					const updateDocument = {
						$set: {
							"dm": [true, req.body.welcomeDmText],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"dm": [false, req.body.welcomeDmText],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// rol 1
				if (req.body.welcomeRoleCheck == "true") {
					const updateDocument = {
						$set: {
							"role": [true, req.body.welcomeRole],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"role": [false, req.body.welcomeRole],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// rol 2
				if (req.body.welcomeRoleCheck2 == "true") {
					const updateDocument = {
						$set: {
							"role2": [true, req.body.welcomeRole2],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"role2": [false, req.body.welcomeRole2],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// rol 3
				if (req.body.welcomeRoleCheck3 == "true") {
					const updateDocument = {
						$set: {
							"role3": [true, req.body.welcomeRole3],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"role3": [false, req.body.welcomeRole3],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// rol 4
				if (req.body.welcomeRoleCheck4 == "true") {
					const updateDocument = {
						$set: {
							"role4": [true, req.body.welcomeRole4],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"role4": [false, req.body.welcomeRole4],
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				// rol 5
				if (req.body.welcomeRoleCheck5 == "true") {
					const updateDocument = {
						$set: {
							"role5": [true, req.body.welcomeRole5],
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"role5": [false, req.body.welcomeRole5],
						},
					};
					await collection.updateOne(filter, updateDocument);
						}
					
			}
		}
		// kayit sistemi bitiş
		// güvenlik sistemi
		if (botFunction == "guvenlik") {
			const dbClient = client.dbClient;
			const db = dbClient.db("botcuk");
			const collection = db.collection("guvenlik");
			const filter = {
				_id: guild.id,
			};
			let result = await collection.findOne(filter);
			if (!result) {
				const doc = {
					"_id": guild.id,
					"channelId": "unset",
					"channelId2": "unset",
					"message": "${memberMention} işlem sınırınızı aştınız sunucudan yasaklanmamak için lütfen \`1\` dakika bekleyin.",
					"message2": "${memberMention} {işlem} eski haline döndürüldü.",
					"enabled": false,
					"botk": false,
					"sunucu": false,
					"rol": false,
					"kanal": false,
					"url": false,
				};
				await collection.insertOne(doc);
			}
			result = await collection.findOne(filter);
			if (req.body.guvenlikSistem) {
				switch (req.body.guvenlikSistem) {
					case "off": {
						const updateDocument = {
							$set: {
								"enabled": false,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
					case "on": {
						const updateDocument = {
							$set: {
								"enabled": true,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
				}
			} else if (!req.body.guvenlikSistem) {
				const forcedUpdateDocument = {
					$set: {
						"channelId": req.body.welcomeChannel,
						"message": req.body.welcomeEmbedText,
						"channelId2": req.body.welcomeChannel2,
						"message2": req.body.welcomeEmbedText2,
					},
				};
				await collection.updateMany(filter, forcedUpdateDocument);
				if (req.body.botCheck == "true") {
					const updateDocument = {
						$set: {
							"botk": true,
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"botk": false,
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				if (req.body.sunucuCheck == "true") {
					const updateDocument = {
						$set: {
							"sunucu": true,
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"sunucu": false,
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				if (req.body.rolCheck == "true") {
					const updateDocument = {
						$set: {
							"rol": true,
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"rol": false,
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				if (req.body.kanalCheck == "true") {
					const updateDocument = {
						$set: {
							"kanal": true,
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"kanal": false,
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
				if (req.body.urlCheck == "true") {
					const updateDocument = {
						$set: {
							"url": true,
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"url": false,
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
			}
		}
		//bitiş
				// otorol sistemi
				if (botFunction == "otorol") {
					const dbClient = client.dbClient;
					const db = dbClient.db("botcuk");
					const collection = db.collection("otoRol");
					const filter = {
						_id: guild.id,
					};
					let result = await collection.findOne(filter);
					if (!result) {
						const doc = {
							"_id": guild.id,
							"role": [false, "unset"],
							"role2": [false, "unset"],
							"enabled": false,
							"userRol": false,
							"botRol": false,
						};
						await collection.insertOne(doc);
					}
					result = await collection.findOne(filter);
					if (req.body.otoRolSistem) {
						switch (req.body.otoRolSistem) {
							case "off": {
								const updateDocument = {
									$set: {
										"enabled": false,
									},
								};
								await collection.updateOne(result, updateDocument);
								break;
							}
							case "on": {
								const updateDocument = {
									$set: {
										"enabled": true,
									},
								};
								await collection.updateOne(result, updateDocument);
								break;
							}
						}
					} else if (!req.body.otoRolSistem) {
						const forcedUpdateDocument = {
							$set: {
								
							},
						};
						await collection.updateMany(filter, forcedUpdateDocument);
						if (req.body.userRolSistem == "true") {
							const updateDocument = {
								$set: {
									"userRol": true,
								},
							};
							await collection.updateOne(filter, updateDocument);
						} else {
							const updateDocument = {
								$set: {
									"userRol": false,
								},
							};
							await collection.updateOne(filter, updateDocument);
						}
						if (req.body.botRolSistem == "true") {
							const updateDocument = {
								$set: {
									"botRol": true,
								},
							};
							await collection.updateOne(filter, updateDocument);
						} else {
							const updateDocument = {
								$set: {
									"botRol": false,
								},
							};
							await collection.updateOne(filter, updateDocument);
						}
						// rol 1
						if (req.body.welcomeRoleCheck == "true") {
							const updateDocument = {
								$set: {
									"role": [true, req.body.welcomeRole],
								},
							};
							await collection.updateOne(filter, updateDocument);
						} else {
							const updateDocument = {
								$set: {
									"role": [false, req.body.welcomeRole],
								},
							};
							await collection.updateOne(filter, updateDocument);
						}
						// rol 2
						if (req.body.welcomeRoleCheck2 == "true") {
							const updateDocument = {
								$set: {
									"role2": [true, req.body.welcomeRole2],
								},
							};
							await collection.updateOne(filter, updateDocument);
						} else {
							const updateDocument = {
								$set: {
									"role2": [false, req.body.welcomeRole2],
								},
							};
							await collection.updateOne(filter, updateDocument);
						}
					}
				}
				//bitiş
						// güvenlik sistemi
		if (botFunction == "otoyanit") {
			const dbClient = client.dbClient;
			const db = dbClient.db("botcuk");
			const collection = db.collection("otoYanit");
			const filter = {
				_id: guild.id,
			};
			let result = await collection.findOne(filter);
			if (!result) {
				const doc = {
					"_id": guild.id,
					"message": "${memberMention} , Aleyküm selam hoş geldin :two_hearts:",
					"enabled": false,
					"selam": false,
				};
				await collection.insertOne(doc);
			}
			result = await collection.findOne(filter);
			if (req.body.otoYanitSistem) {
				switch (req.body.otoYanitSistem) {
					case "off": {
						const updateDocument = {
							$set: {
								"enabled": false,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
					case "on": {
						const updateDocument = {
							$set: {
								"enabled": true,
							},
						};
						await collection.updateOne(result, updateDocument);
						break;
					}
				}
			} else if (!req.body.otoYanitSistem) {
				const forcedUpdateDocument = {
					$set: {
						"message": req.body.welcomeEmbedText,
					},
				};
				await collection.updateMany(filter, forcedUpdateDocument);
				if (req.body.selamCheck == "true") {
					const updateDocument = {
						$set: {
							"selam": true,
						},
					};
					await collection.updateOne(filter, updateDocument);
				} else {
					const updateDocument = {
						$set: {
							"selam": false,
						},
					};
					await collection.updateOne(filter, updateDocument);
				}
			}
		}
		//bitiş

		// Sunucu sahibinin id ve ismini al
 		// ownerID ve ownerName değişkenlerini try bloğu dışında tanımla
 		let ownerID;
 		let ownerName;
 		// guild.fetchOwner metoduyla sunucu sahibini çek
 		try {
   		let owner = await guild.fetchOwner();
  		ownerID = owner.user.id;
   		ownerName = owner.user.username;
 		} catch (error) {
   		// Hata oluşursa konsola yaz
   		console.error(error);
   		ownerID = "Bilinmiyor";
   		ownerName = "Bilinmiyor";
 		}
		//bitiş
		

		// fonksiyon sayfası tüm sistemleri ayarlamak için 
        const html = await ejs.renderFile(`./src/website/views/dashboard/functions/${botFunction}.ejs`, {
			req: req,
            user: req.isAuthenticated() ? req.user : null,
			guild: guild,
            bot: client,
			// ownerID ve ownerName değişkenlerini de parametre olarak ekle
			ownerID: ownerID,
			ownerName: ownerName,
            Permissions: discord.PermissionsBitField,
            botconfig: settings.website,
            callback: settings.config.callback,
			async: true,
		});
		res.send(html);
    });
	// oy verme
	app.get("/vote", (req, res) => {
		return res.redirect("https://top.gg/bot/999282811322253373/vote");
	});
	// destek sunucusu
	app.get("/support", (req, res) => {
		return res.redirect("https://discord.gg/WVe9xcFAFn");
	});
	// davet linki
	app.get("/invite", (req, res) => {
		return res.redirect("https://discord.com/oauth2/authorize?client_id=999282811322253373&permissions=8&scope=bot%20applications.commands");
	});
	// kullanım şartları sayfası
	app.get("/terms-of-service", async (req, res) => {
		const html = await ejs.renderFile('./src/website/views/terms-of-service.ejs', {
			req: req,
			user: req.isAuthenticated() ? req.user : null,
			bot: client,
			Permissions: discord.PermissionsBitField,
			botconfig: settings.website,
			callback: settings.config.callback,
			async: true,
		});

		res.send(html);
	});
	// gizlilik politikası sayfası
	
	app.get("/privacy-policy", async (req, res) => {
		const html = await ejs.renderFile('./src/website/views/privacy-policy.ejs', {
			req: req,
			user: req.isAuthenticated() ? req.user : null,
			bot: client,
			Permissions: discord.PermissionsBitField,
			botconfig: settings.website,
			callback: settings.config.callback,
			async: true,
		});
	
		res.send(html);
	});
	app.get("/dev", async (req, res) => {
		const html = await ejs.renderFile('./src/website/views/dev.ejs', {
			req: req,
			user: req.isAuthenticated() ? req.user : null,
			bot: client,
			Permissions: discord.PermissionsBitField,
			botconfig: settings.website,
			callback: settings.config.callback,
			async: true,
		});

		res.send(html);
	});
	//kök dizinindeki ads bilgilerini tarayıcıya yönlendirme
	app.get ("/ads.txt", function (req, res, next) {
		const options = {
			root: path.join(__dirname)
		};
		
		const fileName = 'ads.txt';
		res.sendFile(fileName, options, function (err) {
			if (err) {
				next(err);
			} else {
				console.log('Sent:', fileName);
			}
		});
});
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	
try{
	//blog modülleri
	const moment = require('moment');
	const slugify = require("slugify");
	var lodash = require("lodash");



	const dbClient = client.dbClient;
	const db = await dbClient.db("botcuk");
	const posts = db.collection("posts");


	function getAllPosts() {
		
		return new Promise((resolve, reject) => {
		
		posts.find({}).toArray((err, foundPosts) => {
			if (err) {
			
			reject(err);
			} else {
			
			resolve(foundPosts);
			}
		});
		});
	}

	
	function generateSlug(title) {
		
		let slug = title.toLowerCase().replace(/[^a-z0-9 ]/g, "");
		
		slug = slug.replace(/\s+/g, "-");
		return slug;
	}
	
	
	async function checkSlug(slug) {
	
		const allPosts = await getAllPosts();
		
		const isUnique = allPosts.every(post => post.slug !== slug);
		return isUnique;
	}
	
	
	async function addSlug(title) {
	
		let slug = generateSlug(title);
		
		let isUnique = await checkSlug(slug);
		
		let counter = 1;
		while (!isUnique) {
		slug = slug + "-" + counter;
		isUnique = await checkSlug(slug);
		counter++;
		}
		
		return slug;
	}


	app.get("/blog", async (req, res) => {
		try {
		
		const foundPosts = await getAllPosts();
		// blog.ejs dosyasını render edelim
		const html = await ejs.renderFile('./src/website/views/blog/blog.ejs', {
			req: req,
			user: req.isAuthenticated() ? req.user : null,
			bot: client,
			Permissions: discord.PermissionsBitField,
			botconfig: settings.website,
			callback: settings.config.callback,
			async: true,
			lodash: lodash,
			posts: foundPosts // post dizisini ekleyelim	
		});
		res.send(html);
		} catch (error) {
		logger.error(error);
		}
	});
	

	// ana  sayfaya blogların bazılarını çekmek için en altta renderlıyoruz
	app.get("/", async (req, res) => {
		try {
			await client.guilds.fetch();
			let users = 0;
			client.guilds.cache.forEach(guild => {
				users += guild.memberCount;
			});
			
			const foundPosts = await getAllPosts();
	
			const html = await ejs.renderFile(`./src/website/views/index.ejs`, {
				req: req,
				user: req.isAuthenticated() ? req.user : null,
				bot: client,
				Permissions: discord.PermissionsBitField,
				botconfig: settings.website,
				callback: settings.config.callback,
				servers: await client.guilds.cache.size,
				users: users,
				version: version,
				vdjs: vdjs,
				vnjs: vnjs,
				async: true,
				lodash: lodash,
				posts: foundPosts // post dizisini ekleyelim	
			});
			res.send(html);
			} catch (error) {
			logger.error(error);
			}		
	});

	
	// Post koleksiyonundan slug'a göre belge bulan bir wrapper fonksiyon
	async function getPostBySlug(req) {
		
		return new Promise( async (resolve, reject) => {
		try {
			// Post koleksiyonundan slug'a göre belge bulalım
			await posts.findOne({ slug: req.params.slug }, (foundPost));
			if (foundPost) {
				resolve(foundPost);
			} else {
				reject(new Error("Post not found"));
			}
			
		} catch (err) {
			logger.error(err);
			
		}
	});
	}

	// 404 sayfası 
	app.get("/error", async (req, res) => {
		const html = await ejs.renderFile('./src/website/views/partials/error1.ejs', {
			req: req,
			user: req.isAuthenticated() ? req.user : null,
			bot: client,
			Permissions: discord.PermissionsBitField,
			botconfig: settings.website,
			callback: settings.config.callback,
			async: true,
		});

		res.send(html);
	});

	// blog post sayfası için bir GET isteği tanımlayalım
	app.get("/blog/:slug", async (req, res) => {
		try {
			await posts.findOne({ slug: req.params.slug }, (err, foundPost) => {
				if (!err) {
				  // Post modelinin null olup olmadığı
				  if (foundPost) {
					// Post modelinin okunma sayısını bir artırMA
					foundPost.postViews += 1;
					// Post modelini
					posts.updateOne({ slug: req.params.slug }, { $set: { postViews: foundPost.postViews } }, async (err) => {
						if (!err) {
							// Tüm postları bulalım
							
							posts.find({}).toArray( async (err, allPosts)  => {
								if (!err) {
									// blog-post.ejs dosyasını render
									const html = await ejs.renderFile("./src/website/views/blog/blog-post.ejs", {
										req: req,
										user: req.isAuthenticated() ? req.user : null,
										bot: client,
										Permissions: discord.PermissionsBitField,
										botconfig: settings.website,
										postTitle: foundPost.postTitle,
										postImage: foundPost.postImage,
										postBody: foundPost.postBody,
										postDate: foundPost.postDate,
										postAuthor: foundPost.postAuthor,
										postViews: foundPost.postViews,
										postId: foundPost._id,
										posts: allPosts, // post dizisini ekleyelim
										async: true,
									});
									res.send(html);
		
								} else {
									console.log(err);
								  }
								});
							  } else {
								console.log(err);
							  }
							});
						  } else {
							// Post modeli null ise, bir hata mesajı
							res.send("Böyle bir post bulunamadı.");
						  }
						} else {
						  console.log(err);
						}
					  });
					
					}catch (error){
						logger.error(error)
						}
					})
	
}catch (error){
	logger.error(error)
	}

//--------------------------------------------------	


	// 404 hatası yakalama fonksiyonu
	app.use((req, res, next) => {
	// istenen rota tanımlanmamışsa
	if (!req.route) {
	  // 404 sayfasına yönlendir
	  res.redirect('/error')
		}
  	})
  	//bitiş



	
	
	// http yayın
	var httpServer = http.createServer(app);
    httpServer.listen(settings.config.port, () => {
        logger.success(`http bağlantısı başarılı. PORT "${settings.config.port}"`);
		logger.success(`Web sitesi bağlanılmaya hazır. DOMAİN "${settings.website.domain}"`);
    });

	/*
	//ssl sertifica
	var privateKey  = fs.readFileSync(__dirname + '/ssl/private.key', 'utf8');
	var certificate = fs.readFileSync(__dirname + '/ssl/certificate.crt', 'utf8');
	var credentials = {key: privateKey, cert: certificate};
	// https yayın
	var httpsServer = https.createServer(credentials, app);
	httpsServer.listen(settings.config.sslPort, () =>{
        logger.success(`Https bağlantısı başarılı. PORT "${settings.config.sslPort}"`);
		logger.success(`Web sitesi bağlanılmaya hazır. DOMAİN "${settings.website.domain}"`);
	})*/


} catch (error) {
	logger.error('Hata:', error);
  }
};