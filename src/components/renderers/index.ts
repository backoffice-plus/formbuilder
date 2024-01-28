import {createEntryByModule} from "../../lib/formbuilder";

import * as GroupCollapsibleRenderer from "./GroupCollapsibleRenderer.vue";
import * as FormbuilderRenderer from "./FormbuilderRendererSetup.vue";
import * as ButtonRenderer from "./ButtonRenderer.vue";
import * as TextRenderer from "./TextRenderer.vue";

export const formbuilderRenderers = [
    createEntryByModule(GroupCollapsibleRenderer),
    createEntryByModule(FormbuilderRenderer),
    createEntryByModule(ButtonRenderer),
    createEntryByModule(TextRenderer),
];
