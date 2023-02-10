import categorizationComp from "../../components/tools/categorization.vue";
import {VerticalLayout} from "./layoutTool";
import type {ToolInterface} from "./index";

export class CategorizationTool extends VerticalLayout {
    importer = () => categorizationComp;

    clone(): ToolInterface {
        return new CategorizationTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Tabs',//this.uischema.type,
            labelAtDropArea: 'Tabs',//this.uischema.type,
            icon: 'mdi:tab',
        }
    }
}

export const categorizationTool = new CategorizationTool('Categorization');

