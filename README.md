![test workflow](https://github.com/Vitorgus/Setup-Godot/actions/workflows/test.yml/badge.svg)

# Setup Godot

This actions setus up Godot in the Github Action runner

It downloads and caches the specified version of the headless Godot executable, and optionally the default export templates

**!!! IT ONLY WORKS ON LINUX RUNNERS !!!**

Any attempt to use this action on windows or macos will throw an error

## Usage

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: vitorgus/setup-godot@v1
    with:
      godot-version: 3.3.3
  - name: Web Build
    run: |
      mkdir -v -p build/web
      godot -v --export "HTML5" ./build/web/index.html
  - uses: actions/upload-artifact@v2
    with:
      name: web
      path: build/web
```

## Inputs


### godot-version `required`

Specifies the version for the Godot executable

### mono `optional`

If the version of godot to setup should be the mono version for C# projects. If false, will download the standard version.

Default Value: `false`

### download-templates `optional`

If the actions should also download Godot's default export templates

Default Value: `true`


## Why linux only?

Godot has a special headless executable made for automated CLI usage, and it's curently only available on linux.

I *guess* one could setup the normal godot version on windows and macOs runners if they really want to. But for now linux will be the only supported platform.
