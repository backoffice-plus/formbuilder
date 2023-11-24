<template>

  <!--  <control-wrapper-->
  <!--      v-bind="layout.controlWrapper"-->
  <!--      :styles="styles"-->
  <!--      :is-focused="isFocused"-->
  <!--      :applied-options="appliedOptions"-->
  <!--  >-->
  <button @click="onclick">T: {{ control?.uischema?.text }}</button>
  <!--  </control-wrapper>-->

  <textarea class="w-full aspect-video">{{useControl}}</textarea>
</template>


<style scoped>

</style>

<script setup lang="ts">
import type {Layout} from '@jsonforms/core';
import {toDataPath} from "@jsonforms/core";
import {rendererProps, useJsonFormsControl,} from '@jsonforms/vue';
import {Resolve} from "@jsonforms/core/src/util/util";
import {normalizeScope} from "../../lib/normalizer";

const props = defineProps(rendererProps<Layout>())

const useControl = useJsonFormsControl(props);
const {control, handleChange} = useControl
//const uischemaLayout = (useControl.layout as any)?.value?.uischema as Layout;
/**
 * :TODO
 * - class / style
 * - rule visibility (hide, disable)
 */

const onclick = () => {
  const schema = control.value?.schema;
  const scope = control.value?.uischema?.scope_property;
  const scopeValue = control.value?.uischema?.scope_value;

  const dataFromSchema = Resolve.data(schema, normalizeScope(scopeValue));

  if ("const" in dataFromSchema) {
    const pathSet = toDataPath(scope);
    handleChange(pathSet, dataFromSchema.const);
  }
}
</script>

<script lang="ts">
import type {RankedTester} from "@jsonforms/core";
import {rankWith, uiTypeIs} from "@jsonforms/core";

export const tester: RankedTester = rankWith(2, uiTypeIs('Button'));
</script>
