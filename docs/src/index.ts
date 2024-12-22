import * as ts from "typescript";

const program = ts.createProgram(["../dist/index.d.ts"], { noLib: true, strict: true });
const checker = program.getTypeChecker();
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

// Visit every sourceFile in the program
for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.fileName.startsWith("..")) continue;
  const root = checker.getSymbolAtLocation(sourceFile);
  if (!root) continue;

  for (const symbol of checker.getExportsOfModule(root)) {
    console.log(symbol.getName());
    const source = checker.getAliasedSymbol(symbol);
    const node = checker.typeToTypeNode(
      checker.getTypeOfSymbol(source),
      undefined,
      ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.MultilineObjectLiterals,
    )!;
    console.log(
      printer.printNode(ts.EmitHint.Unspecified, node, sourceFile),
      ts.displayPartsToString(source.getDocumentationComment(checker)),
    );
  }
}
