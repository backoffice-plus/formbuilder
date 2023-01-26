import {Tool, ToolProps} from "../models";
import unknownComp from "../../components/tools/unknown.vue";

export const unknownTool = new Tool('unknown', ToolProps.create({
    toolType: 'unknown',
    jsonForms: {schema: {}, uischema: {}}
}));
unknownTool.importer = () => unknownComp
