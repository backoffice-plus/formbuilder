import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {ToolInterface} from "../models";
import {Tool} from "../models";
import combinatorAsTabs from "../../components/tools/combinatorAsTabs.vue";
import {jsonForms as toolOptionsCombinator} from "../../schema/toolOptionsCombinator";
import {updatePropertyNameAndScope} from "../formbuilder";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";


export const combinatorTool = new Tool('Control', 'combinator');

combinatorTool.tester = rankWith(2,
    and(
        uiTypeIs('Control'),
        (uischema, schema) => {
            const hasKeyword = undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf;
            const noType = undefined === schema?.type
            return hasKeyword && noType
        }
    )
);
combinatorTool.importer = () => combinatorAsTabs;
combinatorTool.importer = () => combinatorAsTabs;
combinatorTool.optionJsonforms = async () => toolOptionsCombinator;

type keyword = "oneOf" | "anyOf" | "allOf";
const keywords = ['oneOf', 'anyOf', 'allOf'] as Array<keyword>

combinatorTool.optionDataPrepare = (tool: ToolInterface) => {
    const data = {} as any;

    const schema = tool.schema;

    data.propertyName = tool.propertyName;

    keywords.forEach((key:keyword) => {
        const combining = schema[key];
        if(combining && combining?.length > 0) {
            data.keyword = key;
        }
    })

    return data;
};

combinatorTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    updatePropertyNameAndScope(data?.propertyName, tool)

    //:TODO
};
