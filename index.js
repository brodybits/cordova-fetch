/**
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 'License'); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

const Q = require('q');
const fs = require('fs-extra');
const CordovaError = require('cordova-common').CordovaError;
const { getInstalledPath } = require('get-installed-path');
const npa = require('npm-package-arg');
const semver = require('semver');

const lib = require('./fetch-lib.js');
const pathToInstalledPackage = lib.pathToInstalledPackage;
const isNpmInstalled = lib.isNpmInstalled;
const installPackage = lib.installPackage;
const uninstallPackage = lib.uninstallPackage;
const npmArgs = lib.npmArgs;

/*
 * A function that npm installs a module from npm or a git url
 *
 * @param {String} target   the packageID or git url
 * @param {String} dest     destination of where to install the module
 * @param {Object} opts     [opts={save:true}] options to pass to fetch module
 *
 * @return {String|Promise}    Returns string of the absolute path to the installed module.
 *
 */
module.exports = function (target, dest, opts = {}) {
    return Q()
        .then(function () {
            if (!dest || !target) {
                throw new CordovaError('Need to supply a target and destination');
            }
            // Create dest if it doesn't exist yet
            fs.ensureDirSync(dest);
        })
        .then(_ => {
            return pathToInstalledPackage(target, dest)
                .catch(_ => installPackage(target, dest, opts));
        })
        .catch(function (err) {
            throw new CordovaError(err);
        });
};

/* functions from lib: */
module.exports.isNpmInstalled = isNpmInstalled;
module.exports.uninstall = uninstallPackage;
