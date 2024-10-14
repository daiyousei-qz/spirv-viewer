# SPIR-V Viewer

SPIR-V Viewer is an extension that allows you to directly open a SPIR-V binary from Visual Studio Code, giving you a read-only editor and a limited set of intellisense features.

## Features

First of all, of course, you could now open and inspect a SPIR-V binary as if it's a text file! On top of that, this extension also provides you with a few quality-of-life feature including syntax highlighting and hover (the intellisense feature should only work with spirv-dis output, as this extension doesn't implement a full parser).

### Basic Syntax Highlighting
\!\[syntax-highlighting\]\(resrouce/syntax-highlighting.png\)

### OpCode Documentation on Hover
\!\[hover-opcode-documentation\]\(resrouce/hover-opcode-documentation.png\)

### Operand Definition on Hover
\!\[hover-operand-definition\]\(resrouce/hover-operand-definition.png\)

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
* `spirv-viewer.enableInlayHints`: Enable exprimental inlay hints feature for instruction parameter names.

## Known Issues

<!-- Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Release Notes

<!-- Users appreciate release notes as you update your extension. -->

<!-- ### 1.0.0

Initial release of ... -->