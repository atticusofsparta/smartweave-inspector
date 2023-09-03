

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

export function functionArgFlatMap (args:any[]) {

    const flatMap = args.flatMap((arg:any) => {
        if (arg.type === "Identifier") {
            return arg.name;
        } else if (arg.type === "ObjectExpression") {
            return arg.properties.map((prop:any) => {
                return prop.value.name;
            });
        }
    });

    return flatMap;
}