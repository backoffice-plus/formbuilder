import {labelTool} from "./labelTool";
import {categoryTool} from "./categoryTool";
import {categorizationTool} from "./categorizationTool";
import {groupTool} from "./groupTool";
import {horizontalLayout, verticalLayout} from "./layoutTool";
import {selectTool} from "./SelectTool";
import {referenceTool} from "./referenceTool";
import {combinatorTool} from "./combinatorTool";
import {controlTool} from "./controlTool";
import {arrayTool} from "./ArrayTool";
import {objectTool} from "./ObjectTool";
import {constTool} from "./constTool";
import {listWithDetailTool} from "./ListWithDetailTool";
import {layoutRefTool} from "./LayoutRefTool";
import {schemaTool} from "./SchemaTool";
export type {JsonFormsInterface, JsonFormsUISchema} from "../models";

export const layoutTools = [
    verticalLayout,
    horizontalLayout,
    groupTool,
    categorizationTool,
    categoryTool,
    labelTool,
    listWithDetailTool,
    layoutRefTool,
]

export const controlTools = [
    controlTool,
    selectTool,
    referenceTool,
    constTool,

    arrayTool,
    objectTool,
    combinatorTool,
    schemaTool,
]

