
function formatDebugCode(lineList) {
    const startCode = `
import asyncio
import sys
import inspect
sys.stdout.reconfigure(encoding='utf-8')
        
__debugCodeFlag = 0
__debugFinishedFlag = 0

__currentVars = {}

__visibleLines = {}
        
async def wait_for_debug():
    global __debugCodeFlag
    while __debugCodeFlag == 0:
        await asyncio.sleep(0.1)
    __debugCodeFlag = 0
        
async def debug_code():
    global __debugCodeFlag, __debugFinishedFlag
`;
        
    const endCode = `
    __debugFinishedFlag = 1
asyncio.create_task(debug_code())
`;

    let middleCode = "";
    let visibleLineCounter = 1;
    let functionList = [];
    lineList = lineList.filter(line => line.trim() !== "");
    lineList.forEach(
        (line) => {
            const trimmedLine = line.trim();
            const indent = line.substring(0, line.indexOf(trimmedLine));
            let preDefCode = "" // Para tornar capaz de Debugar funções.
            let preCallDefCode = ""; // Para tornar capaz de Debugar funções.
            if (line.startsWith('for ') || line.trim().startsWith('if ') || line.trim().startsWith('elif ') || line.trim().startsWith('else:') || line.trim().startsWith('def ') || line.trim().startsWith('await ')  || line.trim().startsWith('async ')){
                if (line.startsWith('def ')){ // Para tornar capaz de Debugar funções.
                    preDefCode = "async ";
                    const funcName = line.match(/def\s+(\w+)\s*\(/)?.[1];
                    if (funcName) functionList.push(funcName);
                }
                middleCode += `
    ${indent}${preDefCode}${line.trim()}
                `
            } else {
                preCallDefCode = addAwaitBeforeFunctionCall(line.replace(/\s+/g, ''));
                middleCode += `
    ${indent}__realLine = inspect.currentframe().f_lineno
    ${indent}__visibleLines[__realLine] = ${visibleLineCounter}
    ${indent}print(f"[DEBUG] -> Executando linha {__visibleLines[__realLine]}: [ ${trimmedLine} ]")
    ${indent}${preCallDefCode == ""? line.trim() : preCallDefCode.trim()}
    ${indent}await wait_for_debug()
    ${indent}__currentVars.update({k: v for k, v in inspect.currentframe().f_locals.items() if (not k.startswith("__") and not callable(v))})
    `;
            }
            visibleLineCounter++;
    });
    //console.log("cl: "+startCode+middleCode+endCode)
    return startCode + middleCode + endCode;  
}

function addAwaitBeforeFunctionCall(str) {
    let modified = false;
    functionList = ['func'];
    
    functionList.some(funcName => {
        let index = str.indexOf(funcName + "(");
        if (index !== -1) {
            let awaitIndex = str.lastIndexOf(" await ", index);
            if (awaitIndex === -1) {
                str = str.slice(0, index) + " await " + str.slice(index);
                modified = true;
            }
            return true;
        }
        return false;
    });
    
    return modified ? str : "";
}
