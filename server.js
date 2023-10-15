const { createServer } = require("http");
const { parse } = require("url");
const fs = require("fs");
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;
const hostname = "localhost";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const cron = require("node-cron");

const public_url = process.env.RAILWAY_PUBLIC_DOMAIN
	? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
	: `http://localhost:${port}`;

app.prepare().then(() => {
	createServer(async (req, res) => {
		try {
			const parsedUrl = parse(req.url, true);
			await handle(req, res, parsedUrl);
		} catch (err) {
			console.error("Error occurred handling", req.url, err);
			res.statusCode = 500;
			res.end("internal server error");
		}
	})
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`Server running on ${public_url}`);
			cron.schedule("0 * * * *", clean_temp_dir, { runOnInit: true });
		});
});

const clean_temp_dir = async () => {
	console.log("cron: clean_temp_dir");
	fs.readdirSync("/tmp", { withFileTypes: true })
		.filter(
			(d) =>
				d.isDirectory() &&
				fs.statSync(`/tmp/${d.name}`).ctime < new Date(Date.now() - 1000 * 60 * 60 * 1)
		)
		.forEach((dir) => {
			console.log("cron: rm dir:", `/tmp/${dir.name}`);
			fs.rmdirSync(`/tmp/${dir.name}`, { recursive: true });
		});
};
