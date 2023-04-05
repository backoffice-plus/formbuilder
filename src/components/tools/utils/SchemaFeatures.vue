<template>

  <span v-if="hasRules" class="f" title="has Rules">R</span>
  <span v-if="hasDefinitions" class="f" title="has Definitions">D</span>
  <span v-if="hasConditionals" class="f" title="has Conditionals">C</span>


</template>


<style scoped>
.f {
  background-color: var(--toolItem-icon);
  color:var(--base-100);
  @apply
  block h-3.5 w-3.5
  font-mono text-xs
  rounded-full
  flex items-center justify-center
  cursor-help
}
</style>

<script setup>
import {computed} from 'vue'
import {Icon} from "@iconify/vue";
import _ from "lodash";

const props = defineProps({
  tool: Object,//ToolInterface
})


const hasRules = computed(() => !_.isEmpty(props.tool.uischema?.rule));
const hasDefinitions = computed(() => (!_.isEmpty(props.tool.schema?.definitions) || !_.isEmpty(props.tool.schema?.['$defs'])) && !couldBeLayoutTool.value);
const hasConditionals = computed(() => !_.isEmpty(props.tool.schema?.if) && !couldBeLayoutTool.value);
const couldBeLayoutTool = computed(() => props.tool?.uischema?.type && 'Control' !== props.tool?.uischema.type);

</script>
