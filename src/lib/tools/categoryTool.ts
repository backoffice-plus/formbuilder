import {GroupTool,} from "./groupTool";
import type {ToolInterface} from "./index";

export class CategoryTool extends GroupTool {

    clone(): ToolInterface {
        return new CategoryTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: this.uischema.label,
            //hideIconAtDropArea: true,
            //icon: 'mdi:tab-plus',
            hideToolAtBar: true,
            icon: 'mdi:tab',
        }
    }
}

export const categoryTool = new CategoryTool('Category');
