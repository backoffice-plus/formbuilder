import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {Tool} from "../models";
import {groupTool} from "./groupTool";


export const categoryTool = new Tool('Category', );

categoryTool.importer = groupTool.importer;
categoryTool.tester = groupTool.tester;
categoryTool.optionJsonforms = groupTool.optionJsonforms
categoryTool.optionDataPrepare = groupTool.optionDataPrepare;
categoryTool.optionDataUpdate = groupTool.optionDataUpdate
