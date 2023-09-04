import Arweave from "arweave";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

class SWInspector {
  source;
  schemas;
  errors: Error[] = [];
  arweave;
  constructor(
    sourceCode: string, // source code to parse
    jsonSchemas?: Array<any>, // AJV JSON Schema object
    customArweave?: Arweave
  ) {
    this.source = sourceCode; // parse source code for ast eval
    this.schemas = jsonSchemas; // AJV JSON Schema object
    this.arweave =
      customArweave ??
      Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
      }); // arweave instance
  }

  async generateAST() {
    // build AST tree ~ get functions and their props from source code
    // put ast tree into this.ast
    const ast = parse(this.source, {
      sourceType: "module",
    });

    return ast;
  }

  async getContractFunctions() {
    // walk through AST tree and get public contract function by handle function
    const ast = (await this.generateAST()) as any;
    let handlerType; // if statement or switch statement
    let functions: any[] = [];

    /**
     * contracts can employ different patterns for handler function. If statements or switch statements.
     * We must ensure to check for both patterns and use the correct one to get the contract functions.
     * If more patterns are introduced to the ecosystem, we must add them here.
     */

    traverse(ast, {
      SwitchStatement: (path: any) => {
        if (path.node.discriminant?.property?.name === "function") {
          // nullish coalescing assignment operator (say that three times fast)
          handlerType ??= "switch";
          // todo: check for func(state, action) pattern
          const contractFunctions = getSwitchCases(path.node);
          if (contractFunctions.length) {
            const functionDetails = contractFunctions.reduce(
              (acc: any[], curr: any) => {
                const { functionName, contractFunctionName } = curr;
                if (!contractFunctionName) {
                  return acc;
                }
                let requiredInputs: string[] = [];
                traverse(ast, {
                  FunctionDeclaration: (path: any) => {
                    if (path.node.id.name === functionName) {
                      path.traverse({
                        MemberExpression: (path: any) => {
                          if (path.node.object.property?.name === "input") {
                            requiredInputs.push(path.node.property?.name);
                          }
                        },
                      });
                    }
                  },
                  VariableDeclarator: (path: any) => {
                    if (path.node.id?.name === functionName) {
                      path.traverse({
                        ArrowFunctionExpression: (path: any) => {
                          path.traverse({
                            ObjectProperty: (path: any) => {
                              if (path.node.key?.name === "input" && path?.node?.value?.properties) {
                                requiredInputs?.push(
                                  ...path?.node?.value?.properties?.map(
                                    (prop: any) => {
                                      if (prop.value.type === "Identifier") {
                                        // TODO: implement recursive function to get all identifiers
                                        return (
                                          prop.value?.name ??
                                          prop.value.left?.name
                                        );
                                      }
                                    }
                                  )
                                );
                              }
                            },
                          });
                        },
                      });
                    }
                  },
                });
                acc.push({ [contractFunctionName]: [...requiredInputs] });
                return acc;
              },
              []
            );
            functions = [...functionDetails];
          }
        }
      },
      IfStatement: (path: any) => {
        const condition = path.node.test;
        if (
          condition.left?.property?.name === "function" ||
          condition.right?.property?.name === "function"
        ) {
          handlerType ??= "if";
          const functionName =
            condition.left?.property?.name === "function"
              ? condition.right?.value
              : condition.left?.value;
          let requiredInputs: string[] = [];
          path.traverse({
            MemberExpression: (path: any) => {
              if (path.node.object.property?.name === "input") {
                requiredInputs.push(path.node.property?.name);
              }
            },
          });
          functions.push({ [functionName]: requiredInputs });
        }
      },
    });

    return functions;
  }
}



export function getSwitchCases (switchStatement:any) {

    if (!switchStatement?.cases) {
        return []
    }
    const cases = switchStatement.cases?.map((node: any) => {
        const isAwaited = node.consequent[0].argument.type === "AwaitExpression";
        const arg = isAwaited ? node.consequent[0].argument.argument : node.consequent[0].argument;
        const contractFunctionName = node.test?.value;
        // function args can be identifiers or ObjectExpression
        const functionName = arg.callee?.name
        const functionArgs = arg.arguments
        return {
            functionName,
            contractFunctionName,
            functionArgs,
        };
        });

        return cases
}

export default SWInspector;
