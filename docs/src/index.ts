import * as ts from "typescript";
import * as fs from "node:fs";

const file = fs.readFileSync("../README.md", "utf-8");

const start = file.indexOf("## Complete API") + "## Complete API".length;
const end = file.indexOf("## Errors");

if (start === -1 || end === -1) throw new Error("Invalid README.md file");

let out = "\n\n";

const program = ts.createProgram(["../dist/index.d.ts"], { noLib: true, strict: true });
const checker = program.getTypeChecker();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

// Visit every sourceFile in the program
for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.fileName.startsWith("..")) continue;
  const root = checker.getSymbolAtLocation(sourceFile);
  if (!root) continue;

  for (const symbol of checker.getExportsOfModule(root)) {
    const source = checker.getAliasedSymbol(symbol);
    const declaration = source.getDeclarations()?.[0];

    if (!declaration) continue;

    const kind = {
      [ts.SyntaxKind.FunctionDeclaration]: "function",
      [ts.SyntaxKind.ClassDeclaration]: "class",
      [ts.SyntaxKind.InterfaceDeclaration]: "interface",
      [ts.SyntaxKind.TypeAliasDeclaration]: "type",
    }[declaration.kind];

    out += `<details><summary><code>${kind} ${symbol.name}${kind === "function" ? "()" : ""}</code></summary>\n\n`;
    out += `${ts.displayPartsToString(source.getDocumentationComment(checker))}\n\n`;

    if (kind === "interface" || kind === "type") {
      // @ts-expect-error I have no idea why this works, but it works at skipping the docblock
      declaration.pos += 1;
      out += `\`\`\`ts\n${printer.printNode(ts.EmitHint.Unspecified, declaration, sourceFile)}\n\`\`\`\n\n`;
    }

    out += "</details>\n\n";
  }
}

fs.writeFileSync("../README.md", file.slice(0, start) + out + file.slice(end));
