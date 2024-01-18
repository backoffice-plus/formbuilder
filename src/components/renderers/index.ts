import {createEntryByModule} from "../../lib/formbuilder";

import * as DisclosureRenderer from "./DisclosureRendererSetup.vue";
import * as FormbuilderRenderer from "./FormbuilderRendererSetup.vue";
import * as ButtonRenderer from "./ButtonRenderer.vue";
import * as TextRenderer from "./TextRenderer.vue";

export const formbuilderRenderers = [
    createEntryByModule(DisclosureRenderer),
    createEntryByModule(FormbuilderRenderer),
    createEntryByModule(ButtonRenderer),
    createEntryByModule(TextRenderer),
];
