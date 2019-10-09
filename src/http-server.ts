import * as fs from 'fs';
import express = require('express');
import { Logger } from './logger';
import { Browser } from './browser';
import * as boom from 'boom';
import morgan = require('morgan');

export class HttpServer {
  app: express.Express;

  constructor(private options,
              private log: Logger,
              private browser: Browser) {
  }

  start() {
    this.app = express();
    if (this.options.verbose) {
        this.app.use(morgan('combined'));
    }
    this.app.get('/', (req: express.Request, res: express.Response) => {
      res.send('Grafana Image Renderer');
    });

    this.app.get('/render', asyncMiddleware(this.render));
    this.app.use((err, req, res, next) => {
      console.error(err);
      return res.status(err.output.statusCode).json(err.output.payload);
    });

    if (this.options.port) {
        this.app.listen(this.options.port);
        this.log.info(`HTTP Server started, listening on ${this.options.port}`);
    } else if (this.options.socket) {
        this.listenSocket();
    }
  }

  listenSocket() {
      fs.unlink(this.options.socket, () => {
          this.app.set('trust proxy', true);
          const server = this.app.listen(this.options.socket);
          server.on('listening', this.chmodSocket);
          server.on('close', this.removeSocket);
          process.on('SIGINT', () => {
             server.close();
          });
          this.log.info(`HTTP Server started, listening on ${this.options.socket}`);
      });
  }

  chmodSocket = () => {
     fs.chmod(this.options.socket, 0x777, (err) => {
         if (err)
         {
             console.error(err);
             return;
         }
         if (this.options.verbose) {
             this.log.info('Socket access mode changed');
         }
     });
  }

  removeSocket = () => {
      fs.unlink(this.options.socket, () => {this.log.info('Socket removed');});
  }

  render = async (req: express.Request, res: express.Response) => {
    if (!req.query.url) {
      throw boom.badRequest('Missing url parameter');
    }

    let options = {
      url: req.query.url,
      width: req.query.width,
      height: req.query.height,
      filePath: req.query.filePath,
      timeout: req.query.timeout,
      renderKey: req.query.renderKey,
      domain: req.query.domain,
      timezone: req.query.timezone,
      encoding: req.query.encoding,
    };

    if (!options.timeout) options.timeout=15;
    req.connection.setTimeout((options.timeout+1)*1000); // one second more
    if (this.options.verbose) {
      this.log.info(`render request received for ${options.url}`);
    }
    let result = await this.browser.render(options);
    await sendFile(res, result.filePath);
  }
}

const sendFile = (resp: express.Response, p) => new Promise((res, rej) => {
    resp.sendFile(p, (err) => {
        fs.unlink(p, () => {
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    });
});

// wrapper for our async route handlers
// probably you want to move it to a new file
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (!err.isBoom) {
      return next(boom.badImplementation(err));
    }
    next(err);
  });
};

const readFile = (path, opts = 'utf8') => {
  return new Promise((res, rej) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data);
      }
    });
  });
};
