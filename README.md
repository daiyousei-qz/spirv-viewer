# spirv-viewer README

SPIR-V Viewer is an extension that allows you to directly open a SPIR-V binary from Visual Studio Code, giving you a read-only editor and a limited set of intellisense features.

<!-- ## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

## Requirements

This extension relies on your locally installed spirv-dis to disassembly the SPIR-V module. By default, it will find the tool from your PATH. You could also explicitly specify it using `spirv-viewer.spirvDisPath`.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `spirv-viewer.spirvDisPath`: The path to the spirv-dis executable.
* `spirv-viewer.toggleNoIndent`: Turn on --no-indent option for spirv-dis.
* `spirv-viewer.toggleNoHeader`: Turn on --no-header option for spirv-dis.
* `spirv-viewer.toggleRawId`: Turn on --raw-id option for spirv-dis.
* `spirv-viewer.toggleComment`: Turn on --comment option for spirv-dis.

## Known Issues

<!-- Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Release Notes

<!-- Users appreciate release notes as you update your extension. -->

<!-- ### 1.0.0

Initial release of ... -->