import {Tool} from "../models";
import unknownComp from "../../components/tools/unknown.vue";

export const unknownTool = new Tool('unknown');
unknownTool.importer = () => unknownComp
