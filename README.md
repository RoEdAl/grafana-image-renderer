# Grafana Image Renderer [![CircleCI](https://circleci.com/gh/grafana/grafana-image-renderer.svg?style=svg)](https://circleci.com/gh/grafana/grafana-image-renderer)

A Grafana backend plugin that handles rendering panels and dashboards to PNGs using headless Chrome.

## Requirements

### Supported operating systems

- Linux (x64)
- Windows (x64)
- Mac OS X (x64)

### No dependencies

This plugin is packaged in a single executable with [Node.js](https://nodejs.org/) runtime and [Chromium](https://www.chromium.org/Home). It does not require any additional software to be installed on the Grafana server.

## Installation

### Using grafana-cli

**NOTE:** Installing this plugin using grafana-cli is supported from Grafana v6.4.

```
grafana-cli plugins install grafana-image-renderer
```

### Clone into plugins folder

1. Git clone this repo into the Grafana external plugins folder.
2. Install dependencies and build.

    ```
    yarn install --pure-lockfile
    yarn run build
    ```

3. Restart Grafana.

## Remote Rendering

Instead of installing and running the image renderer as a plugin, you can run it as a remote image rendering service using Docker.
Read more about [remote rendering using Docker](https://github.com/grafana/grafana-image-renderer/blob/master/docs/remote_rendering_using_docker.md).

### Rendering server behind reverse proxy

1.  Run server specifying Unix socket path via `--socket` parameter:

      ```
      env NODE_ENV=production CHROME_BIN=/usr/bin/chromium node dist/app.js --socket=/tmp/grafana-renderer.sock
      ```

2.  Configure HTTP server.

      *NGiNX* configuration:


      ```
      location /grafana-image-renderer/ {
          proxy_http_version 1.1;
          proxy_buffering off;
          proxy_ignore_headers X-Accel-Buffering;
          proxy_connect_timeout 15s;
          proxy_read_timeout 600s;
          proxy_send_timeout 15s;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header Host $http_host;
          proxy_set_header X-NginX-Proxy true;
          proxy_pass http://unix://tmp/grafana-renderer.sock:/;
      }
      ```

## Troubleshooting

To get more logging information, update the Grafana configuration:

```
[log]
filters = rendering:debug
```

## Additional information

See [docs](https://github.com/grafana/grafana-image-renderer/blob/master/docs/index.md).
