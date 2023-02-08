import {labelTool} from "./labelTool";
import {categoryTool} from "./categoryTool";
import {categorizationTool} from "./categorizationTool";
import {groupTool} from "./groupTool";
import {horizontalLayout, verticalLayout} from "./layoutTool";
import {selectTool} from "./selectTool";
import {referenceTool} from "./referenceTool";
import {combinatorTool} from "./combinatorTool";
import {controlTool} from "./controlTool";
import {arrayTool} from "./ArrayTool";

export const layoutTools = [
    verticalLayout,
    horizontalLayout,
    groupTool,
    categorizationTool,
    categoryTool,
    labelTool,
]

export const controlTools = [
    controlTool,
    selectTool,
    arrayTool,
    referenceTool,
    combinatorTool,
    itemsTool,
]
