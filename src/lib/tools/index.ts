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
//import {schemaOnlyChildsTool} from "./SchemaOnlyChildsTool";
import {scopeTool} from "./ScopeTool";
export type {JsonFormsInterface, JsonFormsUISchema} from "../models";

export const defaultTools = [

    //control
    controlTool,
    selectTool,
    referenceTool,
    constTool,
    objectTool,
    arrayTool,
    schemaTool,
    //schemaOnlyChildsTool,
    combinatorTool,

    //layout
    verticalLayout,
    horizontalLayout,
    groupTool,
    categorizationTool,
    categoryTool,
    labelTool,
    listWithDetailTool,
    layoutRefTool,
    scopeTool,
]

