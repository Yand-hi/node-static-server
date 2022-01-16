import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

let cacheAge = 31536000;
const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
  const {method, url: path} = request;
  const {pathname} = url.parse(path);
  if (method === 'POST') {
    response.statusCode = 200;
    response.end('fake response !');
    return;
  }

  let filename = pathname.substr(1);
  if (filename === '') {
    filename = 'index.html';
  }
  // response.setHeader('Content-Type', 'text/css ; charset=utf-8');
  fs.readFile(p.resolve(publicDir, filename), (error, data) => {
    if (error) {
      if (error.errno === -4058) {
        response.statusCode = 404;
        fs.readFile(p.resolve(publicDir, '404NotFound.html'), (error, data) => {
          response.end(data);
        });
      } else {
        response.statusCode = 500;
        response.end('服务器繁忙');
      }
    } else {
      response.setHeader('Cache-Control', `public, max-age=${cacheAge}`);
      response.end(data);
    }
  });
});

server.listen(8888);