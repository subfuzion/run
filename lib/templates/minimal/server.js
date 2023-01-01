import {createServer} from 'http';

const network = '0.0.0.0';
const port = Number(process.env.PORT) || 8080;

const shutdownSignals = ['SIGTERM', 'SIGINT'];

const server = createServer((req, res) => {
  console.log(`Received request (${req.url}).`);
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(`<h1>Hello, World!</h1>`);
});

server.listen(port, network, () => {
  const {address, port} = server.address();
  console.log(`Listening on ${address}:${port}`);
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

// Especially important to handle SIGTERM for graceful shutdown.
['SIGTERM', 'SIGINT'].forEach(sig => {
  process.on(sig, async () => await shutdown(sig));
});
