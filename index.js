const { resolve } = require('path');
const { spawn } = require('child_process');
const os = require('os');
const  minimist = require('minimist');
const validate = require('validate-npm-package-name');

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
        const argv = minimist(process.argv.slice(2));
        // get source package.json
        let package = require(resolve(cwd, './package.json'));
        let externalPackage = false;
        if (argv._.length) {
            // try to identify the given package.json
            try {
                const package0 = argv._[0];
                const validation = validate(package0);
                if (validation.errors && validation.errors.length) {
                    throw new Error(validation.errors[0]);
                }
                package = require(resolve(cwd, 'node_modules', package0 , './package.json'));
                externalPackage = true;
            } catch (err) {
                console.error('An error occurred while trying to identify the given package under node_modules dir');
                console.error(err);
                return process.exit(-2);
            }
        }
        if (Object.prototype.hasOwnProperty.call(package, 'peerDependencies')) {
            let packages = Object.keys(package.peerDependencies).map(function(key) {
                if (os.type() === 'Windows_NT') {
                    return `${key}@"${package.peerDependencies[key]}"`;
                }
                return `${key}@${package.peerDependencies[key]}`;
            });
            // exit if peer dependencies are empty
            if (packages.length === 0) {
                return process.exit();
            }
            const args = [
                'i'
            ];
            // get npm save options
            const saveOptions = ['-P','--save-prod','-D','--save-dev','-O','--save-optional','--save-peer'];
            // get arguments without the first argument which is may be a package.json
            const argsWithoutArg = externalPackage ? process.argv.slice(3) : process.argv.slice(2);
            // add packages as arguments
            args.push.apply(args, packages);
            // check if args contain a valid save option
            const includesSaveOption = argsWithoutArg.find((arg) => {
                return saveOptions.includes(arg);
            });
            // if a save option is not given
            if (includesSaveOption == null) {
                // push default option which is --no-save
                argsWithoutArg.push('--no-save')
            }
            args.push.apply(args, argsWithoutArg);
            process.stdout.write(`npm ${args.join(' ')}\n`);
            // change command to npm.cmd on windows
            const cmd = os.type() === 'Windows_NT' ? 'npm.cmd' : 'npm';
            const windowsVerbatimArguments = true;
            const stdio = 'inherit';
            const npm = spawn(cmd, args, {
                cwd, // set current directory
                windowsVerbatimArguments, // do not escape arguments (windows only)
                stdio // set stdout and stderr to parent
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
