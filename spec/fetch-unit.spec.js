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
var fetch = require('../index.js');
var shell = require('shelljs');
var fs = require('fs');
var Q = require('q');
var superspawn = require('cordova-common').superspawn;

describe('unit tests for index.js', function () {
    beforeEach(function () {
        spyOn(superspawn, 'spawn').and.returnValue(true);
        spyOn(shell, 'mkdir').and.returnValue(true);
        spyOn(shell, 'which').and.returnValue(Q());
        spyOn(fetch, 'isNpmInstalled').and.returnValue(Q());
        spyOn(fetch, 'getPath').and.returnValue('some/path');
        spyOn(fs, 'existsSync').and.returnValue(false);
    });

    it('npm install should be called with production flag (default)', function (done) {
        var opts = { cwd: 'some/path', production: true, save: true};
        fetch('platform', 'tmpDir', opts)
            .then(function (result) {
                expect(superspawn.spawn).toHaveBeenCalledWith('npm', jasmine.stringMatching(/production/), jasmine.any(Object));
            })
            .fail(function (err) {
                console.error(err);
                expect(err).toBeUndefined();
            })
            .fin(done);
    });

    it('save-exact should be true if passed in', function (done) {
        var opts = { cwd: 'some/path', save_exact: true };
        fetch('platform', 'tmpDir', opts)
            .then(function (result) {
                expect(superspawn.spawn).toHaveBeenCalledWith('npm', jasmine.stringMatching(/save-exact/), jasmine.any(Object));
            })
            .fail(function (err) {
                console.error(err);
                expect(err).toBeUndefined();
            })
            .fin(done);
    });

    it('noprod should turn production off', function (done) {
        var opts = { cwd: 'some/path', production: false};
        fetch('platform', 'tmpDir', opts)
            .then(function (result) {
                expect(superspawn.spawn).not.toHaveBeenCalledWith('npm', jasmine.stringMatching(/production/), jasmine.any(Object));
            })
            .fail(function (err) {
                console.error(err);
                expect(err).toBeUndefined();
            })
            .fin(done);
    });

    it('when save is false, no-save flag should be passed through', function (done) {
        var opts = { cwd: 'some/path', production: true, save: false};
        fetch('platform', 'tmpDir', opts)
            .then(function (result) {
                expect(superspawn.spawn).toHaveBeenCalledWith('npm', jasmine.stringMatching(/--no-save/), jasmine.any(Object));
            })
            .fail(function (err) {
                console.error(err);
                expect(err).toBeUndefined();
            })
            .fin(done);
    });
});

describe('more unit tests for index.js: internal getPath() call', function () {
    beforeEach(function () {
        spyOn(superspawn, 'spawn').and.returnValue(Promise.resolve('+ my-repo@2.0.0'));
        spyOn(shell, 'mkdir').and.returnValue(true);
        spyOn(shell, 'which').and.returnValue(Q());
        spyOn(fetch, 'isNpmInstalled').and.returnValue(Q());
        spyOn(fetch, 'getPath').and.returnValue('some/path/to/my-repo');
        spyOn(fs, 'existsSync').and.returnValue(false);
    });

    it('internal getPath to be called with correct arguments for: https://scm.service.io/user/my-repo', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'https://scm.service.io/user/my-repo';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git://scm.service.io/user/my-repo', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git://scm.service.io/user/my-repo';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+http://scm.service.io/user/my-repo://scm.service.io/user/my-repo', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+http://scm.service.io/user/my-repo://scm.service.io/user/my-repo';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+https://scm.service.io/user/my-repo://scm.service.io/user/my-repo', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+https://scm.service.io/user/my-repo://scm.service.io/user/my-repo';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: file://my/path/to/my-repo', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'file://my/path/to/my-repo';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: /my/path/to/my-repo', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = '/my/path/to/my-repo';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: https://scm.service.io/user/my-repo#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'https://scm.service.io/user/my-repo#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git://scm.service.io/user/my-repo#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git://scm.service.io/user/my-repo#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+http://scm.service.io/user/my-repo#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+http://scm.service.io/user/my-repo#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+https://scm.service.io/user/my-repo#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+https://scm.service.io/user/my-repo#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: https://scm.service.io/user/my-repo.git', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'https://scm.service.io/user/my-repo.git';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git://scm.service.io/user/my-repo.git', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git://scm.service.io/user/my-repo.git';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+http://scm.service.io/user/my-repo.git', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+http://scm.service.io/user/my-repo.git';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+https://scm.service.io/user/my-repo.git', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+https://scm.service.io/user/my-repo.git';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: https://scm.service.io/user/my-repo.git#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'https://scm.service.io/user/my-repo.git#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git://scm.service.io/user/my-repo.git#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git://scm.service.io/user/my-repo.git#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+http://scm.service.io/user/my-repo.git#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+http://scm.service.io/user/my-repo.git#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+https://scm.service.io/user/my-repo.git#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+https://scm.service.io/user/my-repo.git#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: https://scm.git.service.io/user/my-repo.git', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'https://scm.git.service.io/user/my-repo.git';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git://scm.git.service.io/user/my-repo.git', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git://scm.git.service.io/user/my-repo.git';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+http://scm.git.service.io/user/my-repo.git', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+http://scm.git.service.io/user/my-repo.git';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+https://scm.git.service.io/user/my-repo.git', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+https://scm.git.service.io/user/my-repo.git';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: https://scm.git.service.io/user/my-repo.git#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'https://scm.git.service.io/user/my-repo.git#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git://scm.git.service.io/user/my-repo.git#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git://scm.git.service.io/user/my-repo.git#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+http://scm.git.service.io/user/my-repo.git#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+http://scm.git.service.io/user/my-repo.git#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: git+https://scm.git.service.io/user/my-repo.git#old-tag', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'git+https://scm.git.service.io/user/my-repo.git#old-tag';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });

    it('internal getPath to be called with correct arguments for: https://scm.service.io/user/my-repo-other-url', function () {
        var opts = { cwd: 'some/path', production: true, save: true };
        var url = 'https://scm.service.io/user/my-repo-other-url';
        return fetch(url, 'tmpDir', opts)
            .then(function (result) {
                expect(fetch.getPath).toHaveBeenCalledWith('my-repo', jasmine.stringMatching(/node_modules$/), url);
                expect(result).toBe('some/path/to/my-repo');
            });
    });
});
