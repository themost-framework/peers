# @themost/peers
Install peer dependencies script

## Usage

    npx @themost/peers add-peers

### Install peer dependencies of module

Use `@themost/peers` to install missing peer dependencies of a package which is already a dependency of project. 

    npx @themost/peers <module> [--no-save|--save-optional|--save-dev|--save]

e.g.

    npx @themost/peers @themost/angular --save-dev