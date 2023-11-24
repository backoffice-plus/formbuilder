import {createEntryByModule} from "../../lib/formbuilder";

import * as DisclosureRenderer from "./DisclosureRendererSetup.vue";
import * as FormbuilderRenderer from "./FormbuilderRendererSetup.vue";
import * as ButtonRenderer from "./ButtonRenderer.vue";

export const formbuilderRenderers = [
    createEntryByModule(ButtonRenderer),
    createEntryByModule(DisclosureRenderer),
    createEntryByModule(FormbuilderRenderer),
];
