const { resolve } = require('path');
const { spawn } = require('child_process');

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
        const package = require(resolve(process.cwd(), './package.json'));
        if (Object.prototype.hasOwnProperty.call(package, 'peerDependencies')) {
            let packages = Object.keys(package.peerDependencies).map(function(key) {
                return `${key}@"${package.peerDependencies[key]}"`
            });
            // exit if peer dependencies are empty
            if (packages.length === 0) {
                return process.exit();
            }
            const args = [
                'install'
            ];
            args.push.apply(args, packages);
            args.push.apply(args, [
                '--no-save'
            ]);
            process.stdout.write(`npm ${args.join(' ')}\n`);
            const workingInterval = working();
            const npm = spawn('npm', args, );
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
