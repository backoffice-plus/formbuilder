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
import type {JsonSchema} from "@jsonforms/core";
import type {RankedTester} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, JsonFormsUISchema} from "../models";
import {listWithDetailTool} from "./ListWithDetailTool";
export type {JsonFormsInterface, JsonFormsUISchema}

export const layoutTools = [
    verticalLayout,
    horizontalLayout,
    groupTool,
    categorizationTool,
    categoryTool,
    labelTool,
    listWithDetailTool,
]

export const controlTools = [
    controlTool,
    selectTool,
    referenceTool,
    arrayTool,
    objectTool,
    combinatorTool,
]


export interface ToolInterface {
    uuid: string;

    propertyName: string;
    isRequired: boolean;

    schema: JsonSchema;
    uischema: JsonFormsUISchema|any;
    schemaReadOnly: boolean;

    tester: RankedTester | undefined,
    importer: () => any,
    optionDataPrepare: (tool: ToolInterface) => Record<string, any>;
    optionDataUpdate: (tool: ToolInterface, data: Record<string, any>) => void;
    optionJsonforms: (tool: ToolInterface) => Promise<JsonFormsInterface | undefined>;

    clone: () => ToolInterface;
    toolbarOptions: () => Record<string, any>;
}
