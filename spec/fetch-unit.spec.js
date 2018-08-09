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

describe('fetch', function () {
    // overwrite per test case (hackish solution):
    let fetch, installPackage;
    let pathToInstalledPackage = _ => Promise.reject('bogus');

    beforeEach(function () {
        installPackage = jasmine.createSpy()
            .and.returnValue(Promise.resolve('/foo'));

        fetch = proxyquire('../index', {
            'fs-extra': {
                ensureDirSync: _ => _
            },
            './lib/index.js': {
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

describe('npmArgs', function () {
    const npmArgs = require('../lib').npmArgs;

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
