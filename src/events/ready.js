const logger = require('silly-logger');
const { ActivityType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const settings = require('../website/settings.json');
const readline = require('readline');
const os = require("os");
const process = require("process");


module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

		setTimeout(async() => 
		{
		function updateInfo () {
			// botun pingini ve kullandığı RAM miktarını al
			const ping = client.ws.ping;
			const totalMemory = os.totalmem();
			const usedMemory = os.totalmem() - os.freemem();

			const memoryUsage = process.memoryUsage();
			const allocatedMemory = memoryUsage.heapTotal;
			const usedMemory2 = memoryUsage.heapUsed;

			// Bayt cinsinden olan değerleri GB cinsine çevir
			function bytesToGB(bytes) {
  				return (bytes / 1024 / 1024 / 1024).toFixed(2);
			}
			// Bayt cinsinden olan değerleri GB cinsine çevir
			function bytesToMB(bytes) {
				return (bytes / 1024 / 1024).toFixed(2);
			}
			// son satırı sil
			readline.clearLine(process.stdout, 0);
			readline.cursorTo(process.stdout, 0);
		
			// konsola bu bilgileri yaz
			process.stdout.write(`                                    Ping: ${ping} ms, ${bytesToGB(usedMemory)}/${bytesToGB(totalMemory)} GB  ${bytesToMB(usedMemory2)}/${bytesToMB(allocatedMemory)} MB`);
		  }
		
		  // bu fonksiyonu her saniye çağır
		  setInterval (updateInfo, 1000);
		}, 12 * 1000);

		logger.success(`Discord bağlantısı başarılı.`);
		logger.success(`Giriş ismi \"${client.user.username}\"  Sunucular \"${client.guilds.cache.size}\" Kullanıcılar \"${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}\"`);
		
		require("../website/server.js")(client);
		
			  	//işletim sistemi bilgileri
				  const osVersion = os.version();
				  // ram bilgileri
				  const totalMemory = os.totalmem();
				  const usedMemory = os.totalmem() - os.freemem();
				  const freememMemory = os.freemem();
				
				  const memoryUsage = process.memoryUsage();// proje için ayrılan ram
				  const allocatedMemory = memoryUsage.heapTotal;// kullanılan
				  const usedMemory2 = memoryUsage.heapUsed;// toplam
				
				  function bytesToGB(bytes) 
				  {
					  return (bytes / 1024 / 1024 / 1024).toFixed(2);
				  }

				  function bytesToMB(bytes) 
				  {
					  return (bytes / 1024 / 1024).toFixed(2);
				  }
		  
		  
		  
				  const percent = Math.round((usedMemory / totalMemory) * 100);
				  const percent2 = Math.round((usedMemory2 / (usedMemory2+os.freemem())) * 100);
		  
		  
				client.user.setStatus("online");
		  
			


	},
};
