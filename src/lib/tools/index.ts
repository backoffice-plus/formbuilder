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
import type {JsonSchema} from "@jsonforms/core";
import type {RankedTester} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, JsonFormsUISchema} from "../models";
import {listWithDetailTool} from "./ListWithDetailTool";
import {layoutRefTool} from "./LayoutRefTool";
import {schemaTool} from "./SchemaTool";
export type {JsonFormsInterface, JsonFormsUISchema}

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


export interface ToolInterface {
    uuid: string;

    propertyName: string;
    isRequired: boolean;

    schema: JsonSchema;
    uischema: JsonFormsUISchema|any;
    tester: RankedTester | undefined,
    importer: () => any,
    optionDataPrepare: (context: ToolContext) => Record<string, any>;
    optionDataUpdate: (context: ToolContext, data: Record<string, any>) => void;
    optionJsonforms: (context: ToolContext) => Promise<JsonFormsInterface | undefined>;

    /** :TODO add cloneWithSchema(schema,uischema) **/
    clone: () => ToolInterface;
    toolbarOptions: () => Record<string, any>;

    childs: ToolInterface[]
}

export interface ToolContext {
    builder?: string;
    schemaReadOnly?: string;
    rootSchema?: JsonSchema
}
