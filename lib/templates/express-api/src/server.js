import {app} from "./app.js";

const network = "0.0.0.0";
const port = Number(process.env.PORT) || 8080;

const server = app.listen(port, network, () => {
  const {address, port} = server.address();
  console.log(`Listening on ${address}:${port}`);
});

// =================
// Graceful shutdown
// =================

const shutdownSignals = ['SIGTERM', 'SIGINT'];
shutdownSignals.forEach(sig => {
  process.on(sig, async () => await shutdown(sig));
});

async function shutdown(signal) {
  console.log(`Received ${signal}.`);
  if (shutdownSignals.includes(signal)) {
    if (signal === 'SIGINT') console.log();
    console.log(`Shutting down server.`);
    await server.close();
    console.log('Done.');
    process.exit();
  }
}
