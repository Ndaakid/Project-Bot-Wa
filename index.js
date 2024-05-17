const {
	default: makeWASocket,
	BufferJSON,
	initInMemoryKeyStore,
	DisconnectReason,
	AnyMessageContent,
        makeInMemoryStore,
	useMultiFileAuthState,
	delay
} = require("@whiskeysockets/baileys")
const figlet = require("figlet");
const { serialize } = require("./lib/myfunc");
const logg = require('pino')
const fs = require("fs");
const chalk = require('chalk')
const { connect } = require("http2");
let setting = JSON.parse(fs.readFileSync('./config.json'));
let welcome = JSON.parse(fs.readFileSync('./database/welcome.json'));

function title() {
	console.clear()
	console.log(chalk.bold.green(figlet.textSync('WaBot MD', {
	  font: 'Standard',
	  horizontalLayout: 'default',
	  verticalLayout: 'default',
	  width: 80,
	  whitespaceBreak: false
  })))
  console.log(chalk.yellow(`\n                        ${chalk.yellow('[ Created By Irfan ]')}\n\n${chalk.red('Chitanda Eru Bot')} : ${chalk.white('WhatsApp Bot Multi Device')}\n${chalk.red('Follow Insta Dev')} : ${chalk.white('@irfann._x')}\n${chalk.red('Message Me On WhatsApp')} : ${chalk.white('+62 857-9145-8996')}\n${chalk.red('Donate')} : ${chalk.white('085791458996 ( Ovo/Pulsa/Dana )')}\n`))
}

const store = makeInMemoryStore({ logger: logg().child({ level: 'fatal', stream: 'store' }) })
async function connectWhatsapp() {
	const auth = await useMultiFileAuthState("sessions")
	const conn = makeWASocket({
		printQRInTerminal: true,
		browser: ["Baileys", "", ""],
		auth: auth.state,
		logger: logg({ level: 'fatal' }),
		getMessage: async key => {
			return {
			  
			}
		}
	})
	title()
        store.bind(conn.ev)
		
	conn.ev.on("creds.update", auth.saveCreds);
	conn.ev.on("connection.update", async ({ connection }) => {
		if ( connection == "open") {
			console.log("BOT ONLINE")
		} else if (connection == "close") {
			await connectWhatsapp()
		}
	})

	conn.multi = true
	conn.nopref = false
	conn.prefa = 'anjing'
	conn.mode = 'public'
	conn.ev.on('messages.upsert', async m => {
		if (!m.messages) return;
		var msg = m.messages[0]
		msg = serialize(conn, msg)
		msg.isBaileys = msg.key.id.startsWith('BAE5') || msg.key.id.startsWith('3EB0')
		require('./message/msg')(conn, msg, m, setting, store, welcome)
	})
}

connectWhatsapp()