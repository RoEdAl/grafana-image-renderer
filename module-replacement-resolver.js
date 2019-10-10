//
// APP_MODE: server or plugin
//

const webpack = require('webpack');

module.exports = function(env) {
  const appMode = env.APP_MODE || 'server';
  const modules = { "http-server": appMode === 'server', "grpc-plugin": appMode === 'plugin' };
  console.log( 'modules', modules );
  const replacements = [];

    for (const moduleName in modules) {
        if (modules.hasOwnProperty(moduleName)) {
            (function (name) {
                replacements.push(new webpack.NormalModuleReplacementPlugin(
                    // Match module name on runtime just before compilation.
                    new RegExp('(.*)' + name + '(\\.*)'),
                    function (resource) {
                        resource.request = resource.request.replace(
                            new RegExp(name),
                            // Replace its resource path by adding .empty.ts suffix.
                            modules[name] === true ? name : name + '-empty'
                        );
                    }
                ));
            }(moduleName));
        }
    }

    return replacements;
};
