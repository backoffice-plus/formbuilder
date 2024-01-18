<template>
  <span v-if="label.visible" :class="styles.label.root">
    {{ label.text }}
  </span>
</template>


<script setup lang="ts">
import type {LabelElement,} from '@jsonforms/core';
import {rendererProps, useJsonFormsLabel} from "@jsonforms/vue";
import {useVanillaLabel} from "@jsonforms/vue-vanilla";

const props = defineProps(rendererProps<LabelElement>())

const c = useVanillaLabel(useJsonFormsLabel(props));
const {label, styles} = c;

</script>


<script lang="ts">
import {rankWith, uiTypeIs} from "@jsonforms/core";

export const tester = rankWith(1, uiTypeIs('Text'));
</script>
