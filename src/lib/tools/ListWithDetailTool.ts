import {ControlTool} from "./controlTool";
import {rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";

export class ListWithDetailTool extends ControlTool {

    tester = rankWith(1, uiTypeIs('ListWithDetail'));

    toolbarOptions(): Record<string, any> {
        return {
            hideToolAtBar: true,
        }
    }
}

export const listWithDetailTool = new ListWithDetailTool('ListWithDetail');
