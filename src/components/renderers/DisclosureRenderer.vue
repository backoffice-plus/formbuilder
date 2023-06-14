<template>

    <details>
        <summary><span>{{ layout.label }}</span></summary>

        <dispatch-renderer
            v-for="(element, index) in elements"
                :schema="layout.schema"
                :uischema="element"
                :path="layout.path"
                :enabled="layout.enabled"
                :renderers="layout.renderers"
                :cells="layout.cells"
        />

    </details>

</template>


<style scoped>
details {
    min-height:20px;
    margin-top:13px;

    @apply border border-gray-300

    relative
}
details summary {
    top: -13px;

    @apply px-2 m-0

     left-2 right-2

     absolute

        bg-white

    cursor-pointer
}
details summary span {
    @apply px-2
}
details summary:hover span {
    @apply bg-gray-300
}
details[open] {
    @apply p-1
}

details[open] summary {
    /*@apply p-0*/
}

</style>


<script lang="ts">
import {defineComponent} from "vue";
import type {JsonFormsRendererRegistryEntry, Layout, UISchemaElement} from '@jsonforms/core';
import {rankWith, uiTypeIs} from "@jsonforms/core";
import type {RendererProps} from '@jsonforms/vue';
import {DispatchRenderer, rendererProps, useJsonFormsLayout,} from '@jsonforms/vue';
import {useControl} from "@jsonforms/vue/src/jsonFormsCompositions";

const disclosureRenderer = defineComponent({
    name: 'disclosure-renderer',
    components: {
        DispatchRenderer,
    },
    props: {
        ...rendererProps<Layout>(),
    },
    setup(props: RendererProps<Layout>) {
        const useControl = useJsonFormsLayout(props);
        const uischemaLayout = (useControl.layout as any)?.value?.uischema as Layout;

        return {
            ...useControl,
            elements: uischemaLayout?.elements as UISchemaElement[]
        };
    }
});

export default disclosureRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
    renderer: disclosureRenderer,
    tester: rankWith(2, uiTypeIs('Disclosure')),
};

</script>
