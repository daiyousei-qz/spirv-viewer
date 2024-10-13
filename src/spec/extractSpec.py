import re
import os
import json

CORE_SPEC_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'SPIR-V Specification.html')
CORE_GRAMMAR_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spirv.core.grammar.json')
NS_DEBUG_SPEC_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'NonSemantic.Shader.DebugInfo.100.html')
NS_DEBUG_GRAMMAR_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'extinst.nonsemantic.shader.debuginfo.100.grammar.json')

def loadFile(path):
    try:
        with open(path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"An error occurred: {e}")
        exit(1)

def parseCoreGrammar():
    grammarContent = loadFile(CORE_GRAMMAR_PATH)
    grammar = json.loads(grammarContent)

    result = {}
    for instInfo in grammar["instructions"]:
        opname = instInfo["opname"]
        operands = []
        if "operands" in instInfo:
            operands = instInfo["operands"]

        result[opname] = operands

    return result

def parseNSDebugGrammar():
    grammarContent = loadFile(NS_DEBUG_GRAMMAR_PATH)
    grammar = json.loads(grammarContent)

    result = {}
    for instInfo in grammar["instructions"]:
        opname = instInfo["opname"]
        operands = []
        if "operands" in instInfo:
            operands = instInfo["operands"]

        result[opname] = operands

    return result

def parseCoreDocumentation():
    specContent = loadFile(CORE_SPEC_PATH)
    tableRegex = re.compile(r'<table class="tableblock frame-all grid-all stripes-even stretch">.*?</table>', re.DOTALL)
    opcodeRegex = re.compile(r'<a id="(Op\w+)">')
    classRegex = re.compile(r'class=".*?"')
    tables = tableRegex.findall(specContent)

    result = {}
    for table in tables:
        opcodeMatch = opcodeRegex.search(table)
        if opcodeMatch:
            opcode = opcodeMatch.group(1)
            result[opcode] = classRegex.sub('', table)

    return result

def parseNSDebugDocumentation():
    specContent = loadFile(NS_DEBUG_SPEC_PATH)
    tableRegex = re.compile(r'<table class="tableblock frame-all grid-all stretch">.*?</table>', re.DOTALL)
    opcodeRegex = re.compile(r'<a id="(Debug\w+)">')
    classRegex = re.compile(r'class=".*?"')
    tables = tableRegex.findall(specContent)

    result = {}
    for table in tables:
        opcodeMatch = opcodeRegex.search(table)
        if opcodeMatch:
            opcode = opcodeMatch.group(1)
            result[opcode] = classRegex.sub('', table)

    return result

coreDocumentation = parseCoreDocumentation()
coreGrammar = parseCoreGrammar()
nsDebugDocumentation = parseNSDebugDocumentation()
nsDebugGrammar = parseNSDebugGrammar()

result = []
for opname in coreGrammar.keys():
    operands = coreGrammar[opname]
    if opname in coreDocumentation:
        documentation = coreDocumentation[opname]
    else:
        documentation = "No documentation available."

    result.append({
        "opname": opname,
        "operands": operands,
        "documentation": documentation
    })

for opname in nsDebugGrammar.keys():
    operands = nsDebugGrammar[opname]
    if opname in nsDebugDocumentation:
        documentation = nsDebugDocumentation[opname]
    else:
        documentation = "No documentation available."

    result.append({
        "opname": opname,
        "operands": operands,
        "documentation": documentation
    })

print(json.dumps(result, indent=4))