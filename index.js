const { resolve } = require('path');
const { spawn } = require('child_process');
const os = require('os');

function working() {
    let P = ['\\', '|', '/', '-'];
    let x = 0;
    return setInterval(function() {
        process.stdout.write('\r' + P[x++]);
        x &= 3;
    }, 250);
}

function stopWorking(workingInterval) {
    // clear working interval
    clearInterval(workingInterval);
    // clear working line
    if (typeof process.stdout.clearLine === 'function') {
        process.stdout.clearLine();
    } else {
        process.stdout.write('\r' + '');
    }
    process.stdout.write('\n');
}

(function() {
    try {
        const cwd = process.cwd();
        const package = require(resolve(cwd, './package.json'));
        if (Object.prototype.hasOwnProperty.call(package, 'peerDependencies')) {
            let packages = Object.keys(package.peerDependencies).map(function(key) {
                return `${key}@"${package.peerDependencies[key]}"`
            });
            // exit if peer dependencies are empty
            if (packages.length === 0) {
                return process.exit();
            }
            const args = [
                'i'
            ];
            args.push.apply(args, packages);
            args.push.apply(args, [
                '--no-save',
            ]);
            process.stdout.write(`npm ${args.join(' ')}\n`);
            const workingInterval = working();
            // change command to npm.cmd on windows
            const cmd = os.type() === 'Windows_NT' ? 'npm.cmd' : 'npm';
            const windowsVerbatimArguments = true;
            const npm = spawn(cmd, args, {
                cwd, // set current directory
                windowsVerbatimArguments // do not escape arguments (windows only)
            });
            npm.stdout.on('data', (data) => {
                stopWorking(workingInterval);
                process.stdout.write(data);
              });
            npm.stderr.on('data', (data) => {
                stopWorking(workingInterval);
                process.stderr.write(data);
            });
            npm.on('close', (code) => {
                return process.exit(code);
            });
        }
    } catch (error) {
        console.error(error);
        return process.exit(-1);
    }
})();
