import {ControlTool} from "./controlTool";
import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core";

export class ListWithDetailTool extends ControlTool {

    tester = rankWith(1, uiTypeIs('ListWithDetail'));

    toolbarOptions(): Record<string, any> {
        return {
            hideToolAtBar: true,
        }
    }
}

export const listWithDetailTool = new ListWithDetailTool('ListWithDetail');
