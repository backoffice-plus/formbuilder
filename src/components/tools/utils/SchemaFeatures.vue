<template>

  <span v-if="hasRules" class="f" title="has Rules">R</span>


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

</script>
