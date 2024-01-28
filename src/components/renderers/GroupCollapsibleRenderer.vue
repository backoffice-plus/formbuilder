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
  min-height: 20px;
  margin-top: 13px;

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

<script setup lang="ts">
import type {Layout, UISchemaElement} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsLayout,} from '@jsonforms/vue';

const props = defineProps(rendererProps<Layout>())

const useControl = useJsonFormsLayout(props);
const uischemaLayout = (useControl.layout as any)?.value?.uischema as Layout;
const {layout} = useControl;

const elements = uischemaLayout?.elements as UISchemaElement[];
</script>

<script lang="ts">
import {and, rankWith, uiTypeIs, optionIs, type RankedTester} from "@jsonforms/core";
export const tester: RankedTester = rankWith(3, and(uiTypeIs('Group'), optionIs('collapsible', true)))
</script>
