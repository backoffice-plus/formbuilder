import type {JsonSchema} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import combinatorAsTabs from "../../components/tools/combinatorAsTabs.vue";
import {jsonForms as toolOptionsCombinator} from "../../schema/toolOptionsCombinator";
import {updatePropertyNameAndScope} from "../formbuilder";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";


export const combinatorTool = new Tool('combinatorAsTabs',
    ToolProps.create({
        toolType: 'combinator',
        jsonForms: {schema: {}, uischema: {type: 'Control'}}
    }), rankWith(2,
        and(
            uiTypeIs('Control'),
            (uischema, schema) => {
                const hasKeyword = undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf;
                const noType = undefined === schema?.type
                return hasKeyword && noType
            }
        )
    ));

combinatorTool.importer = () => combinatorAsTabs;
combinatorTool.optionJsonforms = toolOptionsCombinator;

type keyword = "oneOf" | "anyOf" | "allOf";
const keywords = ['oneOf', 'anyOf', 'allOf'] as Array<keyword>

combinatorTool.optionDataPrepare = (tool: ToolInterface) => {
    const data = {} as any;

    const schema = tool.props.jsonForms.schema as JsonSchema;

    data.propertyName = tool.props.propertyName;

    keywords.forEach((key:keyword) => {
        const combining = schema[key];
        if(combining && combining?.length > 0) {
            data.keyword = key;
        }
    })

    return data;
};

combinatorTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.props.jsonForms.schema as JsonSchema;
    const uischema = tool.props.jsonForms.uischema as ControlElement;

    updatePropertyNameAndScope(data?.propertyName, tool)

    //:TODO
};
