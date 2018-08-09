/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

/* eslint-env jasmine */
/* eslint-disable prefer-promise-reject-errors */

const proxyquire = require('proxyquire');

const npmArgs = require('../fetch-lib.js').npmArgs;

describe('fetch - main function', function () {
    // overwrite per test case (hackish solution):
    let fetch, installPackage;
    let pathToInstalledPackage = _ => Promise.reject('bogus');

    beforeEach(function () {
        installPackage = jasmine.createSpy()
            .and.returnValue(Promise.resolve('/foo'));

        fetch = proxyquire('../index', {
            './imports.js': {
                '@global': true,
                ensureDirSync: _ => _
            },
            './fetch-lib.js': {
                pathToInstalledPackage: _ => pathToInstalledPackage(),
                installPackage: installPackage
            }
        });

    });

    it('should return path to installed package', function () {
        pathToInstalledPackage = _ => Promise.resolve('/foo');

        return fetch('foo', 'bar').then(result => {
            expect(result).toBe('/foo');
            expect(installPackage).not.toHaveBeenCalled();
        });
    });

    it('should install package if not found', function () {
        pathToInstalledPackage = _ => Promise.reject()

        return fetch('foo', 'bar').then(result => {
            expect(result).toBe('/foo');
            expect(installPackage).toHaveBeenCalled();
        });
    });
});

describe('fetch - check npm spawn', function () {
    it('should call spawn with correct arguments', function (done) {
        const pathToInstalledPackageSpy = jasmine.createSpy()
            .and.returnValue(Promise.reject('read error'));

        const spawnSpy = jasmine.createSpy()
            .and.returnValue(Promise.resolve('+ abc@1.2.3'));

        const getInstalledPathSpy = jasmine.createSpy()
            .and.returnValue(Promise.resolve('bazbaz/node_modules/abc'));

        const fetch = proxyquire('../index', {
            './imports.js': {
                '@global': true,
                spawn: spawnSpy,
                getInstalledPath: getInstalledPathSpy
            },
            'fs-extra': {
                '@global': true,
                readJsonSync: () => { return { version: '1.2.3' } }
            },
            './fetch-lib.js': {
                // NOTE: In case of proxyquire this will not override 
                // pathToInstalledPackage if called internally within
                // fetch-lib.js
                pathToInstalledPackage: pathToInstalledPackageSpy
            }
        });

        return fetch('https://git.repo.org/abc.git#1.2.3', 'bazbaz').then(resultIgnored => {
            expect(spawnSpy).toHaveBeenCalledWith(
                'npm',
                [ 'install', 'foo', '--production', '--no-save' ],
                { cwd: 'xazbaz' });
            expect(getInstalledPathSpy).toHaveBeenCalledWith('abc', {cwd:'xazbaz', local: true});
            done();
        });
    });
});

describe('npmArgs', function () {
    it('should handle missing options', function () {
        npmArgs('platform');
    });

    it('npm install should be called with production flag (default)', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        expect(npmArgs('platform', opts)).toContain('--production');
    });

    it('save-exact should be true if passed in', function () {
        var opts = { cwd: 'some/path', save_exact: true };
        expect(npmArgs('platform', opts)).toContain('--save-exact');
    });

    it('noprod should turn production off', function () {
        var opts = { cwd: 'some/path', production: false };
        expect(npmArgs('platform', opts)).not.toContain('--production');
    });

    it('when save is false, no-save flag should be passed through', function () {
        var opts = { cwd: 'some/path', production: true, save: false };
        expect(npmArgs('platform', opts)).toContain('--no-save');
    });
});
