import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {Tool} from "../models";
import categorizationComp from "../../components/tools/categorization.vue";
import {verticalLayout} from "./layoutTool";

export const categorizationTool = new Tool('Categorization');

categorizationTool.importer = () => categorizationComp;
categorizationTool.tester = rankWith(1, uiTypeIs('Categorization'));

categorizationTool.optionJsonforms = verticalLayout.optionJsonforms
categorizationTool.optionDataPrepare = verticalLayout.optionDataPrepare;
categorizationTool.optionDataUpdate = verticalLayout.optionDataUpdate
